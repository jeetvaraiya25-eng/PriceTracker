const root = document.getElementById("root");
const ext = globalThis.browser ?? globalThis.chrome;
const DEFAULT_API = "http://localhost:3001";

function detectCurrency() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (/Kolkat|Calcutta/i.test(tz)) return "INR";
    const region = String((navigator.language || "").split("-")[1] || "").toUpperCase();
    const map = { IN: "INR", US: "USD", GB: "GBP", AE: "AED", AU: "AUD", CA: "CAD", SG: "SGD" };
    return map[region] || "USD";
  } catch {
    return "USD";
  }
}

let rates = { USD: 1, INR: 83.5 };

function money(n, source = "USD") {
  if (n == null) return "—";
  const display = detectCurrency();
  const from = rates[source] || 1;
  const to = rates[display] || 1;
  const converted = (Number(n) / from) * to;
  try {
    return new Intl.NumberFormat(display === "INR" ? "en-IN" : undefined, {
      style: "currency",
      currency: display,
    }).format(converted);
  } catch {
    return `${display} ${converted.toFixed(2)}`;
  }
}

function connectForm(base, error = "") {
  root.innerHTML = `
    <p>Paste the token from Dropwatch → Settings → Browser extension.</p>
    <label>API URL</label>
    <input id="api" value="${base}" />
    <label>Token</label>
    <textarea id="token" placeholder="Paste token here"></textarea>
    <button id="save">Connect</button>
    <p id="msg" class="${error ? "err" : ""}">${error}</p>
  `;
  document.getElementById("save").onclick = async () => {
    const nextToken = document.getElementById("token").value.trim();
    const nextApi = document.getElementById("api").value.trim() || DEFAULT_API;
    const msg = document.getElementById("msg");
    if (!nextToken) {
      msg.className = "err";
      msg.textContent = "Paste the token first.";
      return;
    }
    msg.className = "";
    msg.textContent = "Connecting…";
    try {
      const res = await fetch(`${nextApi}/api/auth/me`, {
        headers: { Authorization: `Bearer ${nextToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid token");
      await ext.storage.local.set({ token: nextToken, apiBase: nextApi });
      render();
    } catch (err) {
      msg.className = "err";
      msg.textContent = err.message || "Could not connect. Is the Dropwatch API running?";
    }
  };
}

async function render() {
  try {
    const { token, apiBase } = await ext.storage.local.get(["token", "apiBase"]);
    const base = apiBase || DEFAULT_API;
    if (!token) {
      connectForm(base);
      return;
    }

    root.innerHTML = `<p>Loading your watchlist…</p>`;
    const res = await fetch(`${base}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    try {
      const fx = await fetch(`${base}/api/fx`).then((r) => r.json());
      if (fx?.rates) rates = { USD: 1, ...fx.rates };
    } catch {
      /* keep fallback rates */
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load products");
    const items = (data.products || []).slice(0, 8);
    root.innerHTML = `
      <p class="ok">Connected. On Amazon or Flipkart, click Track on the photo — or Track this page below.</p>
      ${
        items.length
          ? items
              .map(
                (p) =>
                  `<div class="item"><div>${p.name}</div><div class="price">${money(p.currentPrice, p.currency || "USD")}</div></div>`
              )
              .join("")
          : "<p>No products yet.</p>"
      }
      <button id="track">Track this page</button>
      <p class="hint">Safari: click the Dropwatch toolbar icon on Amazon → Always Allow on This Website, or the photo button will not appear.</p>
      <button class="ghost" id="out">Disconnect / change token</button>
    `;
    document.getElementById("track").onclick = trackCurrentPage;
    document.getElementById("out").onclick = async () => {
      await ext.storage.local.remove(["token"]);
      render();
    };
  } catch (err) {
    connectForm("http://localhost:3001", err.message || "Could not open Dropwatch storage.");
  }
}

async function trackCurrentPage() {
  const btn = document.getElementById("track");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Tracking…";
  }
  try {
    const tabs = await ext.tabs.query({ active: true, currentWindow: true });
    const url = tabs?.[0]?.url || "";
    if (!/^https?:/i.test(url) || /localhost|127\.0\.0\.1/i.test(url)) {
      throw new Error("Open an Amazon or Flipkart product page, then click Track this page.");
    }
    const res = await ext.runtime.sendMessage({ type: "TRACK_URL", url });
    if (!res?.ok) throw new Error(res?.error || "Could not add product");
    if (btn) btn.textContent = "Added to Dropwatch";
    setTimeout(render, 900);
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Track this page";
    }
    alert(err.message || "Could not track this page");
  }
}

render();
