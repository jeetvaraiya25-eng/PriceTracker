import * as cheerio from "cheerio";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

export function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

export function parsePrice(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  let s = String(value).trim();
  if (!s) return null;
  s = s.replace(/[^\d.,-]/g, "");
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",") && !s.includes(".")) {
    s = s.replace(",", ".");
  } else {
    s = s.replace(/,/g, "");
  }
  const n = Number.parseFloat(s);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

function absUrl(maybe, base) {
  if (!maybe) return null;
  try {
    return new URL(maybe, base).href;
  } catch {
    return maybe;
  }
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function walkJsonLd(node, acc = []) {
  if (!node) return acc;
  if (Array.isArray(node)) {
    node.forEach((n) => walkJsonLd(n, acc));
    return acc;
  }
  if (typeof node === "object") {
    const types = asArray(node["@type"]).map((t) => String(t).toLowerCase());
    if (types.includes("product") || types.includes("http://schema.org/product")) {
      acc.push(node);
    }
    if (node["@graph"]) walkJsonLd(node["@graph"], acc);
    Object.values(node).forEach((v) => {
      if (v && typeof v === "object") walkJsonLd(v, acc);
    });
  }
  return acc;
}

function offerPrice(product) {
  const offers = asArray(product.offers);
  for (const offer of offers) {
    const price = parsePrice(offer.price ?? offer.lowPrice ?? offer.highPrice);
    if (price) return price;
  }
  return parsePrice(product.price);
}

function productImage(product) {
  const img = product.image;
  if (!img) return null;
  if (typeof img === "string") return img;
  if (Array.isArray(img)) return typeof img[0] === "string" ? img[0] : img[0]?.url;
  return img.url || img.contentUrl || null;
}

function extractJsonLd($) {
  const blocks = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw.trim()) return;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      try {
        blocks.push(JSON.parse(raw.replace(/[\u0000-\u001F]+/g, " ")));
      } catch {
        /* ignore malformed JSON-LD */
      }
    }
  });
  const products = [];
  blocks.forEach((b) => walkJsonLd(b, products));
  for (const product of products) {
    const name = product.name;
    const price = offerPrice(product);
    if (name && price) {
      return {
        name: String(name).trim(),
        imageUrl: productImage(product),
        price,
      };
    }
  }
  return null;
}

function extractMeta($) {
  const pick = (...names) => {
    for (const name of names) {
      const val =
        $(`meta[property="${name}"]`).attr("content") ||
        $(`meta[name="${name}"]`).attr("content");
      if (val) return val;
    }
    return null;
  };
  const name =
    pick("og:title", "twitter:title") ||
    $("h1").first().text() ||
    $("title").text();
  const image = pick("og:image", "twitter:image");
  const price =
    parsePrice(pick("product:price:amount", "og:price:amount", "twitter:data1")) ||
    parsePrice($('[itemprop="price"]').attr("content")) ||
    parsePrice($('[itemprop="price"]').first().text());
  return {
    name: name ? String(name).trim() : null,
    imageUrl: image,
    price,
  };
}

function extractSelectors($) {
  const priceSelectors = [
    '[data-testid="price"]',
    ".a-price .a-offscreen",
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    ".priceToPay",
    ".a-price-whole",
    'span[class*="price"]',
    'p[class*="price"]',
    ".product-price",
    ".price",
  ];
  let price = null;
  for (const sel of priceSelectors) {
    const text = $(sel).first().text() || $(sel).attr("content");
    price = parsePrice(text);
    if (price) break;
  }
  if (!price) {
    const body = $("body").text();
    const match = body.match(/(?:USD|INR|EUR|GBP|Rs\.?|₹|\$|€|£)\s*[\d,.]+/);
    price = parsePrice(match?.[0]);
  }
  const name = $("h1").first().text().trim() || $("title").text().trim();
  const image =
    $("#landingImage").attr("src") ||
    $('img[id*="main"]').attr("src") ||
    $("img").first().attr("src");
  return { name: name || null, imageUrl: image || null, price };
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    throw new Error(`Could not fetch product page (${res.status})`);
  }
  return res.text();
}

function parseHtml(html, url) {
  const $ = cheerio.load(html);
  const jsonLd = extractJsonLd($);
  const meta = extractMeta($);
  const sel = extractSelectors($);
  const name = jsonLd?.name || meta.name || sel.name;
  const price = jsonLd?.price || meta.price || sel.price;
  const imageUrl = absUrl(jsonLd?.imageUrl || meta.imageUrl || sel.imageUrl, url);
  if (!name || !price) {
    return null;
  }
  return {
    name: name.slice(0, 240),
    imageUrl,
    price,
    sourceUrl: url,
    sourceSite: hostnameOf(url),
  };
}

async function fetchWithPuppeteer(url) {
  if (process.env.ENABLE_PUPPETEER !== "true") return null;
  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch {
    return null;
  }
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
    const html = await page.content();
    return parseHtml(html, url);
  } finally {
    await browser.close();
  }
}

export async function scrapeProduct(url) {
  let parsed;
  try {
    const html = await fetchHtml(url);
    parsed = parseHtml(html, url);
  } catch (err) {
    parsed = null;
    if (!process.env.ENABLE_PUPPETEER) {
      throw err;
    }
  }
  if (!parsed) {
    parsed = await fetchWithPuppeteer(url);
  }
  if (!parsed) {
    throw new Error(
      "Could not extract a product name and price from that page. Try a direct product URL."
    );
  }
  return parsed;
}
