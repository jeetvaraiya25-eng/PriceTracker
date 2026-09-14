import * as cheerio from "cheerio";
import { fetchHtml, hostnameOf, parsePrice, isJunkName, cleanProductName } from "./scraper.js";
import { convertAmount, getUsdRates } from "./fx.js";

const STOP = new Set([
  "the", "and", "for", "with", "from", "this", "that", "plus", "new",
  "black", "white", "size", "pack", "gb", "mm", "cm", "in", "of", "to",
  "your", "order", "add", "buy", "shop", "sale", "best", "deal",
]);

const BRANDS = [
  "apple", "samsung", "sony", "google", "oneplus", "xiaomi", "redmi", "nothing",
  "nike", "adidas", "bose", "jbl", "lg", "dell", "hp", "lenovo", "asus",
  "canon", "nikon", "microsoft", "boat", "noise", "fire-boltt", "garmin",
];

export function tokensOf(value) {
  return new Set(
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP.has(word))
  );
}

export function titleScore(a, b) {
  const left = tokensOf(a);
  const right = tokensOf(b);
  if (!left.size || !right.size) return 0;
  let hit = 0;
  for (const word of left) if (right.has(word)) hit += 1;
  return (2 * hit) / (left.size + right.size);
}

export function brandOf(name) {
  const text = String(name || "").toLowerCase();
  return BRANDS.find((brand) => text.includes(brand)) || null;
}

export function pricePlausible(sourcePrice, candidatePrice) {
  const a = Number(sourcePrice);
  const b = Number(candidatePrice);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return false;
  const ratio = b / a;
  return ratio >= 0.4 && ratio <= 2.5;
}

const MODEL_WORDS = [
  "ultra", "airpods", "iphone", "ipad", "macbook", "watch", "galaxy", "pixel", "xm5", "xm4",
];

export function isSameProduct(sourceName, candidateName, sourcePrice, candidatePrice) {
  const source = cleanProductName(sourceName);
  const candidate = cleanProductName(candidateName);
  if (isJunkName(source) || isJunkName(candidate)) return false;
  const brand = brandOf(source);
  if (brand && !String(candidate).toLowerCase().includes(brand)) return false;
  const sourceLower = source.toLowerCase();
  const candidateLower = candidate.toLowerCase();
  for (const word of MODEL_WORDS) {
    if (sourceLower.includes(word) !== candidateLower.includes(word)) return false;
  }
  const score = titleScore(source, candidate);
  if (score < 0.48) return false;
  const left = tokensOf(source);
  const right = tokensOf(candidate);
  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;
  if (shared < 2) return false;
  if (!pricePlausible(sourcePrice, candidatePrice)) return false;
  return true;
}

export function queryFromProduct(product) {
  const name = cleanProductName(product?.name);
  if (name && !isJunkName(name)) return name;
  try {
    const path = decodeURIComponent(new URL(product.source_url).pathname);
    const beforeDp = path.split("/dp/")[0] || path;
    const slug = beforeDp.replace(/\//g, " ").replace(/-/g, " ").replace(/\s+/g, " ").trim();
    if (slug.length > 12 && !isJunkName(slug)) return cleanProductName(slug);
  } catch {
    /* ignore */
  }
  return name || "";
}

export function repairedName(product) {
  const fallback = queryFromProduct(product);
  if (product?.name && !isJunkName(product.name)) return cleanProductName(product.name).slice(0, 240);
  if (fallback && !isJunkName(fallback)) return fallback.slice(0, 240);
  return product?.name || "";
}

function searchQuery(name) {
  return encodeURIComponent(String(name || "").slice(0, 90));
}

function abs(href, base) {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

async function searchAmazon(name, tld = "in") {
  const url = `https://www.amazon.${tld}/s?k=${searchQuery(name)}`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const results = [];
  $('[data-component-type="s-search-result"]').each((_, el) => {
    if (results.length >= 6) return;
    const node = $(el);
    const link = node.find("h2 a").first();
    const href = abs(link.attr("href"), url);
    const title = cleanProductName(
      link.find("span").first().text() || link.text() || node.find("h2").text()
    );
    const priceText = node.find(".a-price .a-offscreen").first().text() || node.find(".a-price-whole").first().text();
    const price = parsePrice(priceText);
    const image = node.find("img.s-image").attr("src");
    const currency = /inr/i.test(priceText) ? "INR" : tld === "in" ? "INR" : "USD";
    if (href && title && !isJunkName(title) && price) {
      results.push({
        name: title.slice(0, 240),
        url: href.split("?")[0],
        price,
        currency,
        imageUrl: image || null,
        sourceSite: `amazon.${tld}`,
      });
    }
  });
  return results;
}

function priceNearNode(node) {
  let cur = node;
  for (let i = 0; i < 3; i++) {
    cur = cur.parent();
    if (!cur?.length) break;
    const labelled = parsePrice(cur.find("div[class*='Nx9bqj'], ._30jeq3").first().text());
    if (labelled) return labelled;
    const match = String(cur.text() || "").match(/(?:₹|Rs\.?|INR|\$)\s*[\d,.]+/);
    const price = parsePrice(match?.[0]);
    if (price) return price;
  }
  return null;
}

async function searchFlipkart(name) {
  const url = `https://www.flipkart.com/search?q=${searchQuery(name)}`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const results = [];
  const seen = new Set();
  $("a[href*='/p/']").each((_, el) => {
    if (results.length >= 8) return;
    const node = $(el);
    const href = abs(node.attr("href"), url);
    if (!href) return;
    const cleanUrl = href.split("?")[0];
    if (seen.has(cleanUrl)) return;
    const title = cleanProductName(
      node.attr("title") ||
        node.find("div[class*='KzDlHZ'], a[class*='wjcEIp'], .s1Q9rs, ._4rR01T").first().text() ||
        node.find("img").attr("alt")
    );
    const price = priceNearNode(node) || parsePrice(node.find("div[class*='Nx9bqj'], ._30jeq3").first().text());
    const image = node.find("img").attr("src") || node.parent().find("img").first().attr("src");
    if (title && !isJunkName(title) && title.length > 12 && price) {
      seen.add(cleanUrl);
      results.push({
        name: title.slice(0, 240),
        url: cleanUrl,
        price,
        currency: "INR",
        imageUrl: image || null,
        sourceSite: "flipkart.com",
      });
    }
  });
  return results;
}

async function searchReliance(name) {
  const url = `https://www.reliancedigital.in/products?q=${searchQuery(name)}`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const results = [];
  const seen = new Set();
  $("a[href*='/product/']").each((_, el) => {
    if (results.length >= 8) return;
    const node = $(el);
    const href = abs(node.attr("href"), url);
    if (!href || /\/products\/?$/i.test(href.split("?")[0])) return;
    const cleanUrl = href.split("?")[0];
    if (seen.has(cleanUrl)) return;
    const title = cleanProductName(
      node.attr("title") || node.find("img").attr("alt") || node.find("img").attr("title") || node.text()
    );
    const price = priceNearNode(node);
    const image = node.find("img").attr("src");
    if (title && !isJunkName(title) && title.length > 12 && price) {
      seen.add(cleanUrl);
      results.push({
        name: title.slice(0, 240),
        url: cleanUrl,
        price,
        currency: "INR",
        imageUrl: image || null,
        sourceSite: "reliancedigital.in",
      });
    }
  });
  return results;
}

async function searchSnapdeal(name) {
  const url = `https://www.snapdeal.com/search?keyword=${searchQuery(name)}&sort=rlvncy`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const results = [];
  const seen = new Set();
  $("a.product-tuple-image, a[href*='/product/']").each((_, el) => {
    if (results.length >= 8) return;
    const node = $(el);
    const href = abs(node.attr("href"), url);
    if (!href || !/\/product\//i.test(href)) return;
    const cleanUrl = href.split("?")[0];
    if (seen.has(cleanUrl)) return;
    const title = cleanProductName(
      node.attr("title") || node.find("img").attr("title") || node.find("img").attr("alt")
    );
    const card = node.closest(".product-tuple-listing, .col-xs-6");
    const price =
      parsePrice(card.find(".product-price, .lfloat.product-price").first().text()) || priceNearNode(node);
    const image = node.find("img").attr("src") || node.find("img").attr("data-src");
    if (title && !isJunkName(title) && title.length > 12 && price) {
      seen.add(cleanUrl);
      results.push({
        name: title.slice(0, 240),
        url: cleanUrl,
        price,
        currency: "INR",
        imageUrl: image || null,
        sourceSite: "snapdeal.com",
      });
    }
  });
  return results;
}

export async function findMatchesAcrossPlatforms(product, currentHost = "") {
  const query = queryFromProduct(product);
  const host = String(currentHost || product?.source_site || "").replace(/^www\./, "");
  const sourcePrice = Number(product.currentPrice ?? product.price);
  const sourceCurrency = String(product.currency || "INR").toUpperCase();
  const rates = await getUsdRates().catch(() => null);
  const searches = [];
  if (!/amazon\.in/i.test(host)) searches.push(searchAmazon(query, "in").catch(() => []));
  if (!/amazon\.com/i.test(host)) searches.push(searchAmazon(query, "com").catch(() => []));
  if (!/flipkart/i.test(host)) searches.push(searchFlipkart(query).catch(() => []));
  if (!/reliancedigital/i.test(host)) searches.push(searchReliance(query).catch(() => []));
  if (!/snapdeal/i.test(host)) searches.push(searchSnapdeal(query).catch(() => []));

  const buckets = await Promise.all(searches);
  const seen = new Set();
  const ranked = [];
  for (const list of buckets) {
    for (const item of list) {
      if (seen.has(item.url)) continue;
      seen.add(item.url);
      const candidatePrice = rates
        ? convertAmount(item.price, item.currency, sourceCurrency, rates)
        : item.price;
      if (!isSameProduct(query, item.name, sourcePrice, candidatePrice)) continue;
      const score = titleScore(query, item.name);
      ranked.push({
        ...item,
        score: Math.round(score * 100) / 100,
        suggested: score >= 0.58,
      });
    }
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, 10);
}

export function platformKey(host) {
  return hostnameOf(`https://${host}`) || host;
}
