import { db, nowSql } from "./db.js";
import { scrapeProduct } from "./scraper.js";
import { sendPriceDropEmail } from "./mailer.js";
import { sendWhatsAppMessage } from "./notify.js";

function latestPrice(productId) {
  return db
    .prepare(
      "SELECT price, checked_at FROM price_history WHERE product_id = ? ORDER BY checked_at DESC, id DESC LIMIT 1"
    )
    .get(productId);
}

export function productWithStats(product) {
  const history = db
    .prepare(
      "SELECT price, checked_at FROM price_history WHERE product_id = ? ORDER BY checked_at ASC, id ASC"
    )
    .all(product.id);
  const prices = history.map((h) => h.price);
  const current = prices.at(-1) ?? null;
  const previous = prices.length > 1 ? prices.at(-2) : current;
  const change = current != null && previous != null ? current - previous : 0;
  const changePct = previous ? (change / previous) * 100 : 0;
  const alert = db.prepare("SELECT * FROM alerts WHERE product_id = ?").get(product.id);
  return {
    ...product,
    whatsappAlerts: Boolean(product.whatsapp_alerts),
    currentPrice: current,
    previousPrice: previous,
    change,
    changePct,
    low: prices.length ? Math.min(...prices) : null,
    high: prices.length ? Math.max(...prices) : null,
    history,
    sparkline: prices.slice(-14),
    targetPrice: alert?.target_price ?? null,
  };
}

export async function addProductFromUrl(url, userId) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("That does not look like a valid URL");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http(s) product URLs are supported");
  }
  const sourceUrl = parsed.href;
  const scraped = await scrapeProduct(sourceUrl);

  const existing = db
    .prepare("SELECT * FROM products WHERE user_id = ? AND source_url = ?")
    .get(userId, sourceUrl);

  if (existing) {
    db.prepare(
      "INSERT INTO price_history (product_id, price, checked_at) VALUES (?, ?, ?)"
    ).run(existing.id, scraped.price, nowSql());
    db.prepare(
      "UPDATE products SET name = ?, image_url = ?, source_site = ? WHERE id = ?"
    ).run(scraped.name, scraped.imageUrl, scraped.sourceSite, existing.id);
    const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(existing.id);
    return productWithStats(updated);
  }

  const result = db
    .prepare(
      `INSERT INTO products (user_id, name, image_url, source_url, source_site)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(userId, scraped.name, scraped.imageUrl, sourceUrl, scraped.sourceSite);
  const id = Number(result.lastInsertRowid);
  db.prepare(
    "INSERT INTO price_history (product_id, price, checked_at) VALUES (?, ?, ?)"
  ).run(id, scraped.price, nowSql());
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  return productWithStats(product);
}

export async function checkProductPrice(product) {
  const scraped = await scrapeProduct(product.source_url);
  const last = latestPrice(product.id);
  db.prepare(
    "INSERT INTO price_history (product_id, price, checked_at) VALUES (?, ?, ?)"
  ).run(product.id, scraped.price, nowSql());
  db.prepare("UPDATE products SET name = ?, image_url = ? WHERE id = ?").run(
    scraped.name,
    scraped.imageUrl,
    product.id
  );
  await maybeFireAlert(product, scraped.price, last?.price);
  return scraped.price;
}

async function maybeFireAlert(product, price, previousPrice) {
  const alert = db.prepare("SELECT * FROM alerts WHERE product_id = ?").get(product.id);
  if (!alert || price > alert.target_price) return;
  if (previousPrice != null && previousPrice <= alert.target_price) return;

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(product.user_id);
  db.prepare("UPDATE alerts SET last_triggered_at = ? WHERE id = ?").run(nowSql(), alert.id);
  db.prepare(
    "INSERT INTO alert_events (product_id, price, target_price, channel) VALUES (?, ?, ?, ?)"
  ).run(product.id, price, alert.target_price, "email");

  try {
    await sendPriceDropEmail({
      to: user.email,
      product,
      price,
      target: alert.target_price,
    });
  } catch (err) {
    console.error("Email alert failed:", err.message);
  }

  if (product.whatsapp_alerts && user.whatsapp_phone) {
    try {
      await sendWhatsAppMessage(
        user.whatsapp_phone,
        `Price dropped on ${product.name}\nNow $${Number(price).toFixed(2)} (target $${Number(alert.target_price).toFixed(2)})\n${product.source_url}`
      );
    } catch (err) {
      console.error("WhatsApp alert failed:", err.message);
    }
  }
}

export async function checkAllProducts() {
  const products = db.prepare("SELECT * FROM products").all();
  const results = [];
  for (const product of products) {
    try {
      const price = await checkProductPrice(product);
      results.push({ id: product.id, ok: true, price });
    } catch (err) {
      console.error(`Check failed for product ${product.id}:`, err.message);
      results.push({ id: product.id, ok: false, error: err.message });
    }
  }
  return results;
}
