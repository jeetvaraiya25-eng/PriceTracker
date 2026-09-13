import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, apiPublicUrl } from "../lib/api.js";
import { bookmarkletHref } from "../lib/format.js";

export default function Settings() {
  const { user, token, refresh } = useAuth();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [whatsapp, setWhatsapp] = useState({ enabled: false, displayNumber: null, chatUrl: null });
  const href = bookmarkletHref(token || "", apiPublicUrl());

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => setWhatsapp(data.whatsapp || {}))
      .catch(() => {});
  }, []);

  async function connectWhatsApp(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api("/api/account/whatsapp", { method: "POST", body: { code } });
      await refresh();
      setCode("");
      setMessage("WhatsApp connected.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function disconnect() {
    await api("/api/account/whatsapp", { method: "DELETE" });
    await refresh();
    setMessage("WhatsApp disconnected.");
  }

  async function checkNow() {
    setChecking(true);
    setError("");
    try {
      const data = await api("/api/products/check-now", { method: "POST" });
      const ok = data.results.filter((r) => r.ok).length;
      setMessage(`Checked ${data.results.length} product(s), ${ok} succeeded.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[#a1a1aa]">Account, bookmarklet, extension token, WhatsApp.</p>
      </div>

      <section className="card p-5">
        <h2 className="font-semibold">Account</h2>
        <p className="mt-2 text-sm text-[#a1a1aa]">{user?.email}</p>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Bookmarklet</h2>
        <p className="mt-2 text-sm text-[#a1a1aa]">Drag this onto your bookmarks bar, then click it on any product page.</p>
        <a href={href} className="btn-primary mt-4 inline-flex cursor-grab px-4 py-2 text-sm">
          + Track with Dropwatch
        </a>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Browser extension</h2>
        <p className="mt-2 text-sm text-[#a1a1aa]">
          Load unpacked from the <code className="text-[#4f8cff]">extension/</code> folder, then paste this token in the popup.
        </p>
        <code className="mt-3 block break-all rounded-lg bg-[#0a0a0c] p-3 text-xs">{token}</code>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">WhatsApp</h2>
        {user?.whatsappConnected ? (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-[#00d97e]">Connected to +{user.whatsappPhone}</p>
            <button onClick={disconnect} className="btn-ghost px-4 py-2 text-sm">
              Disconnect
            </button>
          </div>
        ) : (
          <form onSubmit={connectWhatsApp} className="mt-3 space-y-3">
            <p className="text-sm text-[#a1a1aa]">
              Message the Dropwatch WhatsApp number
              {whatsapp.displayNumber ? ` (${whatsapp.displayNumber})` : ""} and send{" "}
              <code className="text-white">connect</code>. Paste the 6-character code here.
            </p>
            {whatsapp.chatUrl && (
              <a href={whatsapp.chatUrl} target="_blank" rel="noreferrer" className="btn-ghost inline-flex px-4 py-2 text-sm">
                Open WhatsApp
              </a>
            )}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="ABC123"
              className="h-11 w-40 px-3 tracking-[0.3em]"
            />
            <button className="btn-primary block px-4 py-2 text-sm">Connect</button>
          </form>
        )}
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Manual price check</h2>
        <p className="mt-2 text-sm text-[#a1a1aa]">Run the same job the cron uses, for your products only. Useful while testing.</p>
        <button onClick={checkNow} className="btn-ghost mt-4 px-4 py-2 text-sm" disabled={checking}>
          {checking ? "Checking…" : "Check prices now"}
        </button>
      </section>

      {message && <p className="text-sm text-[#00d97e]">{message}</p>}
      {error && <p className="text-sm text-[#ff5c7a]">{error}</p>}
    </div>
  );
}
