export const FREE_PRODUCT_LIMIT = 10;
export const PLUS_PRICE_INR = 999;

export function isPlus(user) {
  return user?.plan === "plus";
}

export function planLabel(user) {
  return isPlus(user) ? "Plus" : "Free";
}

export function atProductLimit(user, count) {
  return !isPlus(user) && count >= FREE_PRODUCT_LIMIT;
}
