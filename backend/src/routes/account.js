import { Router } from "express";
import { db } from "../db.js";
import { authRequired } from "../auth.js";
import { consumeLinkCode } from "../whatsapp.js";
import { productWithStats } from "../engine.js";

const router = Router();

router.post("/whatsapp", authRequired, (req, res) => {
  const code = String(req.body?.code || "").trim().toUpperCase();
  if (!code) return res.status(400).json({ error: "Enter the code from WhatsApp" });
  const phone = consumeLinkCode(code);
  if (!phone) return res.status(400).json({ error: "Invalid or expired code" });
  db.prepare("UPDATE users SET whatsapp_phone = NULL WHERE whatsapp_phone = ?").run(phone);
  db.prepare("UPDATE users SET whatsapp_phone = ? WHERE id = ?").run(phone, req.user.id);
  const user = db.prepare("SELECT id, email, whatsapp_phone FROM users WHERE id = ?").get(req.user.id);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      whatsappPhone: user.whatsapp_phone,
      whatsappConnected: true,
    },
  });
});

router.delete("/whatsapp", authRequired, (req, res) => {
  db.prepare("UPDATE users SET whatsapp_phone = NULL WHERE id = ?").run(req.user.id);
  res.json({ ok: true });
});

router.get("/alerts", authRequired, (req, res) => {
  const events = db
    .prepare(
      `SELECT e.*, p.name, p.image_url, p.source_site, p.source_url
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
