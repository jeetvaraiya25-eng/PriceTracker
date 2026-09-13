import { Router } from "express";
import { db } from "../db.js";
import { authRequired } from "../auth.js";
import { addProductFromUrl, productWithStats } from "../engine.js";

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
    res.status(422).json({ error: err.message });
  }
});

router.use(authRequired);

router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id);
  res.json({ products: rows.map(productWithStats) });
});

router.post("/", async (req, res) => {
  const url = String(req.body?.url || "").trim();
  if (!url) return res.status(400).json({ error: "Paste a product URL" });
  try {
    const product = await addProductFromUrl(url, req.user.id);
    res.status(201).json({ product });
  } catch (err) {
    res.status(422).json({ error: err.message });
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

router.get("/:id", (req, res) => {
  const product = db
    .prepare("SELECT * FROM products WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ product: productWithStats(product) });
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
