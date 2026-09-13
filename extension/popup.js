const root = document.getElementById("root");
const DEFAULT_API = "http://localhost:3001";

function money(n) {
  if (n == null) return "—";
  return `$${Number(n).toFixed(2)}`;
}

async function render() {
  const { token, apiBase } = await chrome.storage.local.get(["token", "apiBase"]);
  const base = apiBase || DEFAULT_API;
  if (!token) {
    root.innerHTML = `
      <p>Paste the auth token from Dropwatch → Settings.</p>
      <input id="api" placeholder="API URL" value="${base}" />
      <input id="token" placeholder="JWT token" />
      <button id="save">Connect</button>
      <p id="msg"></p>
    `;
    document.getElementById("save").onclick = async () => {
      const nextToken = document.getElementById("token").value.trim();
      const nextApi = document.getElementById("api").value.trim() || DEFAULT_API;
      const msg = document.getElementById("msg");
      try {
        const res = await fetch(`${nextApi}/api/auth/me`, {
          headers: { Authorization: `Bearer ${nextToken}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Invalid token");
        await chrome.storage.local.set({ token: nextToken, apiBase: nextApi });
        render();
      } catch (err) {
        msg.className = "err";
        msg.textContent = err.message;
      }
    };
    return;
  }

  root.innerHTML = `<p>Loading your products…</p>`;
  try {
    const res = await fetch(`${base}/api/products`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load products");
    const items = (data.products || []).slice(0, 8);
    root.innerHTML = `
      <p class="ok">Connected</p>
      ${
        items.length
          ? items
              .map(
                (p) =>
                  `<div class="item"><div>${p.name}</div><div class="price">${money(p.currentPrice)}</div></div>`
              )
              .join("")
          : "<p>No products yet. Click Track this price on a product page.</p>"
      }
      <button class="ghost" id="out">Disconnect</button>
    `;
    document.getElementById("out").onclick = async () => {
      await chrome.storage.local.remove(["token"]);
      render();
    };
  } catch (err) {
    root.innerHTML = `<p class="err">${err.message}</p><button class="ghost" id="out">Disconnect</button>`;
    document.getElementById("out").onclick = async () => {
      await chrome.storage.local.remove(["token"]);
      render();
    };
  }
}

render();
