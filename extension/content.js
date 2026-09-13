/**
 * Dropwatch content script
 * Customize:
 * - PRICE_RE / looksLikeProductPage() — when the floating button appears
 * - injectButton() styles/placement — default is top-right on any product-like page
 * - Restrict domains in manifest.json content_scripts.matches instead of all URLs
 */

const PRICE_RE = /(?:USD|INR|EUR|GBP|Rs\.?|₹|\$|€|£)\s?\d[\d,]*(?:\.\d{2})?/;

function looksLikeProductPage() {
  if (document.querySelector('script[type="application/ld+json"]')?.textContent?.includes("Product")) {
    return true;
  }
  if (document.querySelector('[itemprop="price"], meta[property="product:price:amount"], meta[property="og:price:amount"]')) {
    return true;
  }
  return PRICE_RE.test(document.body?.innerText?.slice(0, 20000) || "");
}

function toast(text, ok = true) {
  const el = document.createElement("div");
  el.textContent = text;
  Object.assign(el.style, {
    position: "fixed",
    top: "16px",
    right: "16px",
    zIndex: "2147483647",
    background: "#0d0d0f",
    color: "#f5f5f5",
    border: `1px solid ${ok ? "#00d97e" : "#ff5c7a"}`,
    padding: "12px 16px",
    borderRadius: "10px",
    font: "13px Inter, system-ui, sans-serif",
  });
  document.documentElement.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function injectButton() {
  if (document.getElementById("dropwatch-track-btn")) return;
  const btn = document.createElement("button");
  btn.id = "dropwatch-track-btn";
  btn.type = "button";
  btn.textContent = "Track this price";
  Object.assign(btn.style, {
    position: "fixed",
    top: "18px",
    right: "18px",
    zIndex: "2147483646",
    background: "#4f8cff",
    color: "#06101f",
    border: "0",
    borderRadius: "10px",
    padding: "10px 14px",
    font: "600 13px Inter, system-ui, sans-serif",
    cursor: "pointer",
  });
  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.textContent = "Tracking…";
    chrome.runtime.sendMessage({ type: "TRACK_URL", url: location.href }, (res) => {
      btn.disabled = false;
      btn.textContent = "Track this price";
      if (chrome.runtime.lastError) {
        toast(chrome.runtime.lastError.message, false);
        return;
      }
      if (!res?.ok) {
        toast(res?.error || "Could not add product", false);
        return;
      }
      toast("Added to your price tracker");
    });
  });
  document.documentElement.appendChild(btn);
}

if (looksLikeProductPage()) {
  injectButton();
}
