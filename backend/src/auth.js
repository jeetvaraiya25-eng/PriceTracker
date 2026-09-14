import jwt from "jsonwebtoken";
import { db } from "./db.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export const USER_COLS = "id, email, name, whatsapp_phone, plan";

export function loadUser(id) {
  return db.prepare(`SELECT ${USER_COLS} FROM users WHERE id = ?`).get(id);
}

export function publicUser(row) {
  if (!row) return null;
  const username = row.name || null;
  return {
    id: row.id,
    email: row.email,
    name: username,
    username,
    plan: row.plan === "plus" ? "plus" : "free",
    whatsappPhone: row.whatsapp_phone,
    whatsappConnected: Boolean(row.whatsapp_phone),
  };
}

export function normalizeUsername(raw) {
  const username = String(raw || "").trim().replace(/\s+/g, " ");
  if (username.length < 2 || username.length > 24) {
    return { error: "Username should be 2–24 characters" };
  }
  if (!/^[\p{L}\p{N} .'_-]+$/u.test(username)) {
    return { error: "Use letters, numbers, spaces, or . _ - '" };
  }
  return { username };
}

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "30d",
  });
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Sign in required" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = loadUser(payload.id);
    if (!user) return res.status(401).json({ error: "Account not found" });
    req.user = user;
    req.token = token;
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
}

export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = loadUser(payload.id);
    req.token = token;
  } catch {
    req.user = null;
  }
  next();
}
