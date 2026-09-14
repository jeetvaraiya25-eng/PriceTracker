import { ArrowUp, Loader2, Link2, Plus } from "lucide-react";
import { useState } from "react";

export default function AddProductBar({ onAdd, busy, variant = "default" }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const composer = variant === "composer";

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await onAdd(url.trim());
      setUrl("");
    } catch (err) {
      setError(err.message);
      setShake(true);
      window.setTimeout(() => setShake(false), 220);
    }
  }

  return (
    <form onSubmit={submit} className="w-full">
      {composer ? (
        <div className={shake ? "shake" : ""}>
          <textarea
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Paste a product URL — Amazon, Best Buy, or any shop with a public price"
            className="input-plain min-h-[88px] w-full resize-none text-[15px] leading-7 placeholder:text-[#586490]"
            disabled={busy}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-[#586490]">Dropwatch will scrape the price and keep a history.</p>
            <button
              type="submit"
              disabled={busy || !url.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#ff488b] text-[#101421] disabled:opacity-40"
              aria-label={busy ? "Adding product" : "Track product"}
            >
              {busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
            </button>
          </div>
        </div>
      ) : (
        <div className={`flex flex-col gap-2 sm:flex-row sm:items-stretch ${shake ? "shake" : ""}`}>
          <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-[#0c101c] px-3.5 focus-within:border-[#ff488b]/75 focus-within:shadow-[0_0_0_3px_rgba(255,72,139,0.16)]">
            <Link2 size={16} className="shrink-0 text-[#586490]" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a product URL to start tracking"
              className="input-plain h-full min-w-0 flex-1 text-sm"
              disabled={busy}
            />
          </label>
          <button
            type="submit"
            disabled={busy || !url.trim()}
            className="btn-primary inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {busy ? "Adding…" : "Add product"}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-[#ff5c7a]">{error}</p>}
    </form>
  );
}
