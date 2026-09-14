export const CURRENCIES = [
  { code: "INR", label: "Indian Rupee", region: "India" },
  { code: "USD", label: "US Dollar", region: "United States" },
  { code: "EUR", label: "Euro", region: "Eurozone" },
  { code: "GBP", label: "British Pound", region: "United Kingdom" },
  { code: "AED", label: "UAE Dirham", region: "UAE" },
  { code: "SAR", label: "Saudi Riyal", region: "Saudi Arabia" },
  { code: "AUD", label: "Australian Dollar", region: "Australia" },
  { code: "CAD", label: "Canadian Dollar", region: "Canada" },
  { code: "SGD", label: "Singapore Dollar", region: "Singapore" },
  { code: "JPY", label: "Japanese Yen", region: "Japan" },
  { code: "CNY", label: "Chinese Yuan", region: "China" },
  { code: "HKD", label: "Hong Kong Dollar", region: "Hong Kong" },
  { code: "KRW", label: "South Korean Won", region: "South Korea" },
  { code: "CHF", label: "Swiss Franc", region: "Switzerland" },
  { code: "PKR", label: "Pakistani Rupee", region: "Pakistan" },
  { code: "BDT", label: "Bangladeshi Taka", region: "Bangladesh" },
  { code: "NPR", label: "Nepalese Rupee", region: "Nepal" },
  { code: "LKR", label: "Sri Lankan Rupee", region: "Sri Lanka" },
  { code: "MYR", label: "Malaysian Ringgit", region: "Malaysia" },
  { code: "THB", label: "Thai Baht", region: "Thailand" },
  { code: "PHP", label: "Philippine Peso", region: "Philippines" },
  { code: "NZD", label: "New Zealand Dollar", region: "New Zealand" },
  { code: "ZAR", label: "South African Rand", region: "South Africa" },
  { code: "BRL", label: "Brazilian Real", region: "Brazil" },
  { code: "MXN", label: "Mexican Peso", region: "Mexico" },
];

const REGION_CURRENCY = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  AU: "AUD",
  CA: "CAD",
  SG: "SGD",
  JP: "JPY",
  CN: "CNY",
  HK: "HKD",
  KR: "KRW",
  CH: "CHF",
  PK: "PKR",
  BD: "BDT",
  NP: "NPR",
  LK: "LKR",
  MY: "MYR",
  TH: "THB",
  PH: "PHP",
  NZ: "NZD",
  ZA: "ZAR",
  BR: "BRL",
  MX: "MXN",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  IE: "EUR",
  AT: "EUR",
  PT: "EUR",
  BE: "EUR",
  FI: "EUR",
  GR: "EUR",
  ID: "IDR",
  VN: "VND",
  TR: "TRY",
  EG: "EGP",
  NG: "NGN",
  KE: "KES",
};

const TZ_REGION = {
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
  "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA",
  "Asia/Karachi": "PK",
  "Asia/Dhaka": "BD",
  "Asia/Kathmandu": "NP",
  "Asia/Colombo": "LK",
  "Asia/Singapore": "SG",
  "Asia/Tokyo": "JP",
  "Asia/Shanghai": "CN",
  "Asia/Hong_Kong": "HK",
  "Asia/Seoul": "KR",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Bangkok": "TH",
  "Asia/Manila": "PH",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Toronto": "CA",
  "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX",
  "Europe/London": "GB",
  "Europe/Berlin": "DE",
  "Europe/Paris": "FR",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL",
  "Australia/Sydney": "AU",
  "Pacific/Auckland": "NZ",
  "Africa/Johannesburg": "ZA",
};

const LOCALE_BY_CURRENCY = {
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

const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "IDR", "INR"]);

export function currencySymbol(code = "USD") {
  const c = String(code || "USD").toUpperCase();
  try {
    const parts = new Intl.NumberFormat(localeForCurrency(c), {
      style: "currency",
      currency: c,
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value || c;
  } catch {
    return c;
  }
}

export function parseMoneyInput(raw) {
  const n = Number(String(raw ?? "").replace(/,/g, "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

export function roundMoney(amount, code = "USD") {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  const digits = ZERO_DECIMAL.has(String(code || "USD").toUpperCase()) ? 0 : 2;
  const f = 10 ** digits;
  return Math.round(Number(amount) * f) / f;
}

export function localeForCurrency(code) {
  return LOCALE_BY_CURRENCY[code] || "en-US";
}

export function detectCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (TZ_REGION[tz] && REGION_CURRENCY[TZ_REGION[tz]]) {
      return REGION_CURRENCY[TZ_REGION[tz]];
    }
    if (/Kolkat|Calcutta/i.test(tz)) return "INR";
  } catch {
    /* ignore */
  }

  try {
    const lang = navigator.language || navigator.languages?.[0] || "en-US";
    const locale = new Intl.Locale(lang);
    const region = locale.region || locale.maximize?.().region;
    if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region];
  } catch {
    const lang = typeof navigator !== "undefined" ? navigator.language : "";
    const region = String(lang.split("-")[1] || "").toUpperCase();
    if (REGION_CURRENCY[region]) return REGION_CURRENCY[region];
  }
  return "USD";
}

export function convertAmount(amount, from, to, rates) {
  if (amount == null || Number.isNaN(Number(amount))) return null;
  if (!from || !to || from === to) return Number(amount);
  const src = rates?.[from] || 1;
  const dst = rates?.[to] || 1;
  return (Number(amount) / src) * dst;
}

export function formatMoney(amount, currency = "USD") {
  if (amount == null || Number.isNaN(Number(amount))) return "—";
  const code = String(currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat(localeForCurrency(code), {
      style: "currency",
      currency: code,
      maximumFractionDigits: ZERO_DECIMAL.has(code) ? 0 : 2,
    }).format(Number(amount));
  } catch {
    return `${code} ${Number(amount).toFixed(2)}`;
  }
}

export function pct(n) {
  if (n == null || Number.isNaN(Number(n))) return "0%";
  const v = Number(n);
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export function siteLabel(host) {
  if (!host) return "Web";
  return host.replace(/^www\./, "");
}

export function matchesQuery(product, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  return [product?.name, siteLabel(product?.source_site), product?.source_url]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

export function relativeTime(value) {
  if (!value) return "";
  const date = new Date(String(value).includes("T") ? value : `${String(value).replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function bookmarkletHref(_token, _apiBase, appOrigin) {
  const origin =
    appOrigin || (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173");
  const src = `(function(){var o=${JSON.stringify(origin)};var h=location.hostname;if(h==='localhost'||h==='127.0.0.1'){alert('Open a product page on Amazon (or another shop), then click Track with Dropwatch.');return;}location.href=o+'/app?add='+encodeURIComponent(location.href);})();`;
  return `javascript:${encodeURIComponent(src)}`;
}
