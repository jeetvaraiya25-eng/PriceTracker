import { Router } from "express";
import { db } from "../db.js";
import { authRequired } from "../auth.js";
import { addProductFromUrl, productWithStats, checkProductPrice } from "../engine.js";
import { findMatchesAcrossPlatforms, isSameProduct, queryFromProduct, repairedName } from "../compare.js";
import { assertPlus, sendPlanError } from "../plans.js";

const router = Router();

router.post("/whatsapp", async (req, res) => {
  const phone = String(req.body?.phone || req.body?.whatsapp_phone || "").replace(/[^\d]/g, "");
  const url = String(req.body?.url || "").trim();
  if (!phone || !url) {
    return res.status(400).json({ error: "phone and url are required" });
  }
  const user = db.prepare("SELECT * FROM users WHERE whatsapp_phone = ?").get(phone);
  if (!user) {
    return res.status(401).json({ error: "This WhatsApp number is not linked to a Dropwatch account" });
  }
  try {
    const product = await addProductFromUrl(url, user.id);
    res.status(201).json({ product });
  } catch (err) {
    sendPlanError(res, err);
  }
});

router.use(authRequired);

router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json({ products: rows.map(persistRepairedName).map(productWithStats) });
});

router.post("/", async (req, res) => {
  const url = String(req.body?.url || "").trim();
  if (!url) return res.status(400).json({ error: "Paste a product URL" });
  try {
    const product = await addProductFromUrl(url, req.user.id);
    res.status(201).json({ product });
  } catch (err) {
    sendPlanError(res, err);
  }
});

router.post("/check-now", async (req, res) => {
  const mine = db.prepare("SELECT * FROM products WHERE user_id = ?").all(req.user.id);
  const results = [];
  for (const product of mine) {
    try {
      const { checkProductPrice } = await import("../engine.js");
      const price = await checkProductPrice(product);
      results.push({ id: product.id, ok: true, price });
    } catch (err) {
      results.push({ id: product.id, ok: false, error: err.message });
    }
  }
  res.json({ results });
});

function persistRepairedName(product) {
  const name = repairedName(product);
  if (name && name !== product.name) {
    db.prepare("UPDATE products SET name = ? WHERE id = ?").run(name, product.id);
    return { ...product, name };
  }
  return product;
}

function deleteProductRow(id) {
  db.prepare("DELETE FROM price_history WHERE product_id = ?").run(id);
  db.prepare("DELETE FROM alerts WHERE product_id = ?").run(id);
  db.prepare("DELETE FROM alert_events WHERE product_id = ?").run(id);
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

router.get("/:id", (req, res) => {
  let product = db
    .prepare("SELECT * FROM products WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  product = persistRepairedName(product);
  res.json({ product: productWithStats(product) });
});

function ownedProduct(req) {
  return db
    .prepare("SELECT * FROM products WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
}

function groupIdFor(product) {
  return product.group_id || product.id;
}

router.post("/:id/find-matches", async (req, res) => {
  try {
    assertPlus(req.user, "Shop compare");
  } catch (err) {
    return sendPlanError(res, err);
  }
  let product = ownedProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found" });
  try {
    try {
      await checkProductPrice(product);
    } catch {
      /* URL slug / stored name still work as the search query */
    }
    product = persistRepairedName(ownedProduct(req) || product);
    const stats = productWithStats(product);
    const linked = db
      .prepare("SELECT source_url FROM products WHERE user_id = ? AND (id = ? OR group_id = ?)")
      .all(req.user.id, product.id, groupIdFor(product));
    const skip = new Set(linked.map((row) => row.source_url));
    const matches = (await findMatchesAcrossPlatforms(stats, product.source_site)).filter(
      (item) => !skip.has(item.url)
    );
    res.json({ matches, query: queryFromProduct(stats) });
  } catch (err) {
    res.status(422).json({ error: err.message || "Could not search other platforms" });
  }
});

router.get("/:id/compare", (req, res) => {
  try {
    assertPlus(req.user, "Shop compare");
  } catch (err) {
    return sendPlanError(res, err);
  }
  const product = ownedProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const gid = groupIdFor(product);
  const rows = db
    .prepare(
      "SELECT * FROM products WHERE user_id = ? AND (id = ? OR group_id = ?) ORDER BY created_at ASC"
    )
    .all(req.user.id, product.id, gid)
    .map(persistRepairedName)
    .map(productWithStats);
  const primary = rows.find((item) => item.id === product.id) || rows[0];
  const query = queryFromProduct(primary);
  const listings = [];
  for (const item of rows) {
    if (item.id === primary.id) {
      listings.push(item);
      continue;
    }
    if (isSameProduct(query, item.name, primary.currentPrice, item.currentPrice)) {
      listings.push(item);
    } else {
      db.prepare("UPDATE products SET group_id = ? WHERE id = ?").run(item.id, item.id);
    }
  }
  const cheapestId =
    listings.length > 1
      ? listings.slice().sort((a, b) => (a.currentPrice ?? Infinity) - (b.currentPrice ?? Infinity))[0]?.id
      : null;
  res.json({
    listings,
    cheapestId,
    count: listings.length,
    lows: listings.map((item) => item.currentPrice).filter((price) => price != null),
  });
});

router.post("/:id/listings", async (req, res) => {
  try {
    assertPlus(req.user, "Shop compare");
  } catch (err) {
    return sendPlanError(res, err);
  }
  const product = ownedProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const url = String(req.body?.url || "").trim();
  if (!url) return res.status(400).json({ error: "Paste a product URL from another shop" });
  let existingId = null;
  try {
    existingId = db
      .prepare("SELECT id FROM products WHERE user_id = ? AND source_url = ?")
      .get(req.user.id, new URL(url).href)?.id;
  } catch {
    existingId = null;
  }
  try {
    const listing = await addProductFromUrl(url, req.user.id, { groupId: groupIdFor(product) });
    const original = persistRepairedName(productWithStats(product));
    if (
      !isSameProduct(
        queryFromProduct(original),
        listing.name,
        original.currentPrice,
        listing.currentPrice
      )
    ) {
      if (!existingId) {
        deleteProductRow(listing.id);
      } else {
        db.prepare("UPDATE products SET group_id = ? WHERE id = ?").run(listing.id, listing.id);
      }
      return res.status(422).json({
        error: "That page does not look like the same product (name or price is too different).",
      });
    }
    res.status(201).json({ product: listing });
  } catch (err) {
    sendPlanError(res, err);
  }
});

router.delete("/:id/listings/:listingId", (req, res) => {
  const product = ownedProduct(req);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const listingId = Number(req.params.listingId);
  if (listingId === product.id) {
    return res.status(400).json({ error: "Unlink the other shop instead of this listing" });
  }
  const listing = db
    .prepare("SELECT * FROM products WHERE id = ? AND user_id = ?")
    .get(listingId, req.user.id);
  if (!listing) return res.status(404).json({ error: "Listing not found" });
  if (groupIdFor(listing) !== groupIdFor(product) && listing.group_id !== product.id) {
    return res.status(404).json({ error: "Listing is not in this comparison" });
  }
  const keep = req.query.keep === "1" || req.query.keep === "true";
  if (keep) {
    db.prepare("UPDATE products SET group_id = ? WHERE id = ?").run(listing.id, listing.id);
    return res.json({ ok: true, kept: true });
  }
  deleteProductRow(listing.id);
  res.json({ ok: true });
});

router.get("/:id/history", (req, res) => {
  const product = db
    .prepare("SELECT id FROM products WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const history = db
    .prepare(
      "SELECT id, price, checked_at FROM price_history WHERE product_id = ? ORDER BY checked_at ASC, id ASC"
    )
    .all(product.id);
  res.json({ history });
});

router.patch("/:id", (req, res) => {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  if (req.body.targetPrice != null && req.body.targetPrice !== "") {
    const target = Number(req.body.targetPrice);
    if (!Number.isFinite(target) || target <= 0) {
      return res.status(400).json({ error: "Enter a valid target price" });
    }
    db.prepare(
      `INSERT INTO alerts (product_id, target_price) VALUES (?, ?)
       ON CONFLICT(product_id) DO UPDATE SET target_price = excluded.target_price, last_triggered_at = NULL`
    ).run(product.id, target);
  }

  if (typeof req.body.whatsappAlerts === "boolean") {
    db.prepare("UPDATE products SET whatsapp_alerts = ? WHERE id = ?").run(
      req.body.whatsappAlerts ? 1 : 0,
      product.id
    );
  }

  const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(product.id);
  res.json({ product: productWithStats(updated) });
});

router.delete("/:id", (req, res) => {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  db.prepare("DELETE FROM price_history WHERE product_id = ?").run(product.id);
  db.prepare("DELETE FROM alerts WHERE product_id = ?").run(product.id);
  db.prepare("DELETE FROM alert_events WHERE product_id = ?").run(product.id);
  db.prepare("DELETE FROM products WHERE id = ?").run(product.id);
  res.json({ ok: true });
});

export default router;
