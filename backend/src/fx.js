const FALLBACK_RATES = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.78,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  AUD: 1.52,
  CAD: 1.36,
  SGD: 1.34,
  NZD: 1.66,
  JPY: 149,
  CNY: 7.2,
  HKD: 7.8,
  KRW: 1350,
  CHF: 0.88,
  PKR: 278,
  BDT: 110,
  NPR: 133,
  LKR: 300,
  MYR: 4.45,
  THB: 34,
  PHP: 58,
  IDR: 15500,
  VND: 25000,
  ZAR: 18.2,
  BRL: 5.5,
  MXN: 18,
  TRY: 34,
  EGP: 49,
  NGN: 1600,
  KES: 129,
};

let cache = { at: 0, rates: { ...FALLBACK_RATES } };

export async function getUsdRates() {
  if (cache.at && Date.now() - cache.at < 6 * 60 * 60 * 1000) return cache.rates;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    if (data?.result === "success" && data.rates) {
      cache = { at: Date.now(), rates: { USD: 1, ...data.rates } };
    }
  } catch (err) {
    console.error("FX fetch failed:", err.message);
  }
  return cache.rates;
}

export function convertAmount(amount, from = "USD", to = "USD", rates = FALLBACK_RATES) {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  if (!from || !to || from === to) return Number(amount);
  const src = rates[from] || FALLBACK_RATES[from] || 1;
  const dst = rates[to] || FALLBACK_RATES[to] || 1;
  return (Number(amount) / src) * dst;
}

export function formatMoney(amount, currency = "USD") {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  const code = String(currency || "USD").toUpperCase();
  const zeroDecimal = ["JPY", "KRW", "VND", "IDR"];
  try {
    return new Intl.NumberFormat(localeForCurrency(code), {
      style: "currency",
      currency: code,
      maximumFractionDigits: zeroDecimal.includes(code) ? 0 : 2,
    }).format(Number(amount));
  } catch {
    return `${code} ${Number(amount).toFixed(2)}`;
  }
}

export function localeForCurrency(code) {
  const map = {
    INR: "en-IN",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    AED: "en-AE",
    SAR: "en-SA",
    AUD: "en-AU",
    CAD: "en-CA",
    SGD: "en-SG",
    JPY: "ja-JP",
    CNY: "zh-CN",
    HKD: "zh-HK",
    KRW: "ko-KR",
    CHF: "de-CH",
    PKR: "en-PK",
    BDT: "en-BD",
    NPR: "en-NP",
    LKR: "en-LK",
    MYR: "ms-MY",
    THB: "th-TH",
    PHP: "en-PH",
    NZD: "en-NZ",
    ZAR: "en-ZA",
    BRL: "pt-BR",
    MXN: "es-MX",
  };
  return map[code] || "en-US";
}
