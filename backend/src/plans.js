import { db } from "./db.js";

export const FREE_PRODUCT_LIMIT = 10;

export function isPlus(user) {
  return user?.plan === "plus";
}

export function productCount(userId) {
  return db.prepare("SELECT COUNT(*) AS n FROM products WHERE user_id = ?").get(userId)?.n || 0;
}

export function assertCanAddProduct(user) {
  if (isPlus(user)) return;
  if (productCount(user.id) >= FREE_PRODUCT_LIMIT) {
    const err = new Error(
      `Free includes ${FREE_PRODUCT_LIMIT} tracked products. Upgrade to Plus for unlimited tracking.`
    );
    err.status = 403;
    err.code = "plan_limit";
    throw err;
  }
}

export function assertPlus(user, feature = "This") {
  if (isPlus(user)) return;
  const err = new Error(`${feature} is on Plus. Upgrade to unlock compare, export, and unlimited tracking.`);
  err.status = 403;
  err.code = "plus_required";
  throw err;
}

export function sendPlanError(res, err) {
  res.status(err.status || 422).json({ error: err.message, code: err.code });
}
