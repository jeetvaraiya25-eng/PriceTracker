import { Router } from "express";
import { db } from "../db.js";
import { authRequired, publicUser, normalizeUsername, loadUser } from "../auth.js";
import { consumeLinkCode } from "../whatsapp.js";
import { productWithStats } from "../engine.js";
import { assertPlus, sendPlanError } from "../plans.js";

const router = Router();

function saveProfile(req, res) {
  const parsed = normalizeUsername(req.body?.username);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  db.prepare("UPDATE users SET name = ? WHERE id = ?").run(parsed.username, req.user.id);
  res.json({ user: publicUser(loadUser(req.user.id)) });
}

router.patch("/profile", authRequired, saveProfile);
router.post("/profile", authRequired, saveProfile);

router.patch("/plan", authRequired, (req, res) => {
  const plan = req.body?.plan === "plus" ? "plus" : "free";
  db.prepare("UPDATE users SET plan = ? WHERE id = ?").run(plan, req.user.id);
  res.json({ user: publicUser(loadUser(req.user.id)) });
});

router.get("/export", authRequired, (req, res) => {
  try {
    assertPlus(req.user, "Export history");
  } catch (err) {
    return sendPlanError(res, err);
  }
  const rows = db
    .prepare("SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user.id)
    .map(productWithStats);
  const header = ["Name", "Shop", "URL", "Currency", "Current price", "Target", "Low", "High", "Added"];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        csvEscape(row.name),
        csvEscape(row.source_site),
        csvEscape(row.source_url),
        csvEscape(row.currency),
        csvEscape(row.currentPrice),
        csvEscape(row.targetPrice),
        csvEscape(row.low),
        csvEscape(row.high),
        csvEscape(row.created_at),
      ].join(",")
    );
  }
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="dropwatch-history.csv"');
  res.send(lines.join("\n"));
});

function csvEscape(value) {
  if (value == null || value === "") return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

router.post("/whatsapp", authRequired, (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase();
  if (!code) return res.status(400).json({ error: "Enter the code from WhatsApp" });
  const phone = consumeLinkCode(code);
  if (!phone) return res.status(400).json({ error: "Invalid or expired code" });
  db.prepare("UPDATE users SET whatsapp_phone = NULL WHERE whatsapp_phone = ?").run(phone);
  db.prepare("UPDATE users SET whatsapp_phone = ? WHERE id = ?").run(phone, req.user.id);
  res.json({ user: publicUser(loadUser(req.user.id)) });
});

router.delete("/whatsapp", authRequired, (req, res) => {
  db.prepare("UPDATE users SET whatsapp_phone = NULL WHERE id = ?").run(req.user.id);
  res.json({ ok: true });
});

router.get("/alerts", authRequired, (req, res) => {
  const events = db
    .prepare(
      `SELECT e.*, p.name, p.image_url, p.source_site, p.source_url, p.currency
       FROM alert_events e
       JOIN products p ON p.id = e.product_id
       WHERE p.user_id = ?
       ORDER BY e.created_at DESC
       LIMIT 50`
    )
    .all(req.user.id);
  const watching = db
    .prepare(
      `SELECT p.* FROM products p
       JOIN alerts a ON a.product_id = p.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`
    )
    .all(req.user.id)
    .map(productWithStats);
  res.json({ events, watching });
});

export default router;
