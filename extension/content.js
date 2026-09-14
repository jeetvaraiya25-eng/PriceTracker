/**
 * Pins a Track button on the product photo (Amazon and similar shops).
 * Search/listing pages keep a floating button; product pages retry until the
 * visible gallery is ready so we don’t stick the control on a hidden wrapper.
 */
const PRICE_RE = /(?:USD|INR|EUR|GBP|Rs\.?|₹|\$|€|£)\s?\d[\d,]*(?:\.\d{2})?/;
const PHOTO_SELECTORS = [
  "#imgTagWrapperId",
  "#main-image-container",
  "#imageBlock_feature_div",
  "#desktop_unifiedImage_feature_div",
  "#unrolledImageContainer",
  "#imageBlock",
  "#landingImage",
  "#imgBlkFront",
  ".imgTagWrapper",
  "img[data-old-hires]",
  "[data-testid='image-wrapper']",
  "._2r_T1I",
  "#leftCol",
];

function onAppOrigin() {
  const host = location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

function amazonHost() {
  return /(^|\.)amazon\./i.test(location.hostname.replace(/^www\./, ""));
}

function flipkartHost() {
  return /(^|\.)flipkart\./i.test(location.hostname.replace(/^www\./, ""));
}

function isProductPage() {
  if (onAppOrigin()) return false;
  const path = location.pathname;
  if (amazonHost()) {
    return (
      /\/(dp|gp\/product|gp\/aw\/d)\//i.test(path) ||
      Boolean(document.querySelector("#productTitle, #titleSection, #ppd, #dp-container, #dp"))
    );
  }
  if (flipkartHost()) {
    return /\/p\//i.test(path);
  }
  if (/(^|\.)myntra\.|^croma\.|^reliancedigital\./i.test(location.hostname.replace(/^www\./, ""))) {
    return true;
  }
  if (document.querySelector('script[type="application/ld+json"]')?.textContent?.includes('"Product"')) {
    return true;
  }
  if (document.querySelector('[itemprop="price"], meta[property="product:price:amount"], meta[property="og:price:amount"]')) {
    return true;
  }
  return PRICE_RE.test(document.body?.innerText?.slice(0, 20000) || "");
}

function isListingPage() {
  if (onAppOrigin() || isProductPage()) return false;
  if (amazonHost() || flipkartHost()) return true;
  return false;
}

function visibleRect(el) {
  if (!el || !(el instanceof Element)) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 200 || r.height < 180) return null;
  if (r.bottom < 90 || r.top > window.innerHeight - 60) return null;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return null;
  return r;
}

function asHost(el) {
  if (!el) return null;
  const host = el.tagName === "IMG" ? el.parentElement || el : el;
  return visibleRect(host) ? host : null;
}

function largestVisibleImage(root) {
  const scope = root || document;
  const imgs = [...scope.querySelectorAll("img")];
  let best = null;
  let area = 0;
  for (const img of imgs) {
    const host = asHost(img);
    if (!host) continue;
    const r = visibleRect(host);
    const next = (r?.width || 0) * (r?.height || 0);
    if (next > area) {
      area = next;
      best = host;
    }
  }
  return best;
}

function findImageHost() {
  for (const sel of PHOTO_SELECTORS) {
    const host = asHost(document.querySelector(sel));
    if (host) return host;
  }
  return (
    largestVisibleImage(document.querySelector("#ppd, #dp-container, #dp, #leftCol, #container")) ||
    largestVisibleImage(document.querySelector("main")) ||
    null
  );
}

function toast(text, ok = true) {
  document.getElementById("dropwatch-toast")?.remove();
  const el = document.createElement("div");
  el.id = "dropwatch-toast";
  el.textContent = text;
  Object.assign(el.style, {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: "2147483647",
    background: "#101421",
    color: "#f5f5f5",
    border: `1px solid ${ok ? "#3ee0a0" : "#ff5c7a"}`,
    padding: "12px 16px",
    borderRadius: "10px",
    font: "13px 'Plus Jakarta Sans', system-ui, sans-serif",
  });
  document.documentElement.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function styleButton(btn, onPhoto) {
  Object.assign(btn.style, {
    position: onPhoto ? "absolute" : "fixed",
    left: onPhoto ? "12px" : "auto",
    bottom: onPhoto ? "12px" : "auto",
    top: onPhoto ? "auto" : "18px",
    right: onPhoto ? "auto" : "18px",
    zIndex: "2147483646",
    background: "#ff488b",
    color: "#101421",
    border: "0",
    borderRadius: "999px",
    padding: "10px 14px",
    font: "600 13px 'Plus Jakarta Sans', system-ui, sans-serif",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(16, 20, 33, 0.35)",
  });
}

function sendTrack(url) {
  const ext = globalThis.browser ?? globalThis.chrome;
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (res) => {
      if (settled) return;
      settled = true;
      const err = ext.runtime.lastError;
      if (err) reject(new Error(err.message));
      else resolve(res);
    };
    try {
      const maybe = ext.runtime.sendMessage({ type: "TRACK_URL", url }, finish);
      if (maybe && typeof maybe.then === "function") {
        maybe.then((res) => finish(res)).catch(reject);
      }
    } catch (err) {
      reject(err);
    }
  });
}

function wireClick(btn) {
  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    btn.disabled = true;
    btn.textContent = "Tracking…";
    try {
      const res = await sendTrack(location.href);
      if (!res?.ok) {
        toast(res?.error || "Could not add product. Open the extension and paste your token from Settings.", false);
      } else {
        toast("Added to Dropwatch");
      }
    } catch (err) {
      toast(err.message || "Could not reach Dropwatch.", false);
    } finally {
      btn.disabled = false;
      btn.textContent = "Track with Dropwatch";
    }
  });
}

function ensureButton() {
  let btn = document.getElementById("dropwatch-track-btn");
  if (btn) return btn;
  btn = document.createElement("button");
  btn.id = "dropwatch-track-btn";
  btn.type = "button";
  btn.textContent = "Track with Dropwatch";
  wireClick(btn);
  return btn;
}

function placeButton(host) {
  const btn = ensureButton();
  const place = host ? "photo" : "float";
  if (btn.dataset.place === place && (!host || host.contains(btn))) return place;

  styleButton(btn, Boolean(host));
  btn.dataset.place = place;

  if (host) {
    const style = getComputedStyle(host);
    if (style.position === "static") host.style.position = "relative";
    if (style.overflow === "hidden" && (host.clientHeight < 220 || host.clientWidth < 220)) {
      const parent = asHost(host.parentElement) || host;
      if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
      parent.appendChild(btn);
      return "photo";
    }
    host.appendChild(btn);
    return "photo";
  }

  document.documentElement.appendChild(btn);
  return "float";
}

function injectButton() {
  if (onAppOrigin()) return;
  if (isProductPage()) {
    placeButton(findImageHost());
    return;
  }
  if (isListingPage()) {
    placeButton(null);
  }
}

let observer = null;
let observerUntil = 0;

function watchForGallery() {
  if (observer || !isProductPage()) return;
  observerUntil = Date.now() + 12000;
  observer = new MutationObserver(() => {
    if (Date.now() > observerUntil) {
      observer.disconnect();
      observer = null;
      return;
    }
    const btn = document.getElementById("dropwatch-track-btn");
    if (btn?.dataset.place === "photo" && findImageHost()?.contains(btn)) {
      observer.disconnect();
      observer = null;
      return;
    }
    injectButton();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

function boot() {
  injectButton();
  if (isProductPage()) watchForGallery();
}

function onNavigate() {
  document.getElementById("dropwatch-track-btn")?.remove();
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  setTimeout(boot, 300);
  setTimeout(boot, 1200);
  setTimeout(boot, 2800);
}

boot();
setTimeout(boot, 800);
setTimeout(boot, 2200);

let lastUrl = location.href;
setInterval(() => {
  if (location.href === lastUrl) return;
  lastUrl = location.href;
  onNavigate();
}, 600);
