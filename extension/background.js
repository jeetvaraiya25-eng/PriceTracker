/**
 * Dropwatch background worker (Chrome + Safari)
 * Customize DEFAULT_API if your backend is not on localhost:3001
 * (users can also set apiBase from the popup).
 */
const ext = globalThis.browser ?? globalThis.chrome;
const DEFAULT_API = "http://localhost:3001";

async function settings() {
  const { token, apiBase } = await ext.storage.local.get(["token", "apiBase"]);
  return { token, apiBase: apiBase || DEFAULT_API };
}

ext.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "TRACK_URL") return;
  (async () => {
    const { token, apiBase } = await settings();
    if (!token) {
      sendResponse({ ok: false, error: "Open the Dropwatch toolbar icon and paste your auth token first." });
      return;
    }
    try {
      const res = await fetch(`${apiBase}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: message.url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        sendResponse({ ok: false, error: data.error || "Request failed" });
        return;
      }
      sendResponse({ ok: true, product: data.product });
    } catch (err) {
      sendResponse({
        ok: false,
        error: err.message || "Could not reach Dropwatch. Is the API running on localhost:3001?",
      });
    }
  })();
  return true;
});
