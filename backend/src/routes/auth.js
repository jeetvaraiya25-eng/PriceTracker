import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { signToken, authRequired, publicUser, normalizeUsername } from "../auth.js";

const router = Router();

router.post("/register", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Enter a valid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  const parsed = normalizeUsername(req.body?.username || [req.body?.firstName, req.body?.lastName].filter(Boolean).join(" "));
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const name = parsed.username;
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) return res.status(409).json({ error: "An account with that email already exists" });
  const hash = bcrypt.hashSync(password, 10);
  const plan = req.body?.plan === "plus" ? "plus" : "free";
  const result = db
    .prepare("INSERT INTO users (email, password_hash, name, plan) VALUES (?, ?, ?, ?)")
    .run(email, hash, name, plan);
  const user = publicUser({ id: Number(result.lastInsertRowid), email, name, plan, whatsapp_phone: null });
  return res.status(201).json({ token: signToken(user), user });
});

router.post("/login", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  const user = publicUser(row);
  return res.json({ token: signToken(user), user });
});

router.get("/me", authRequired, (req, res) => {
  res.json({
    user: publicUser(req.user),
    token: req.token,
  });
});

export default router;
