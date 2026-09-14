import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import CompareChart from "./CompareChart.jsx";
import { api } from "../lib/api.js";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { relativeTime, siteLabel } from "../lib/format.js";
import { scaleIn, motionSafe, staggerContainer } from "../lib/motion.js";

export default function CompareSection({ productId, onRefresh }) {
  const { format } = useCurrency();
  const reduced = useReducedMotion();
  const [compare, setCompare] = useState({ listings: [], cheapestId: null });
  const [matches, setMatches] = useState(null);
  const [manualUrl, setManualUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [decideId, setDecideId] = useState(null);

  async function loadCompare() {
    const data = await api(`/api/products/${productId}/compare`);
    setCompare(data);
    await onRefresh?.();
  }

  useEffect(() => {
    loadCompare().catch((err) => setError(err.message));
  }, [productId]);

  async function findMatches() {
    setBusy(true);
    setError("");
    try {
      const data = await api(`/api/products/${productId}/find-matches`, { method: "POST" });
      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirm(url) {
    setBusy(true);
    setError("");
    try {
      await api(`/api/products/${productId}/listings`, { method: "POST", body: { url } });
      setManualUrl("");
      setMatches((list) => (list || []).filter((item) => item.url !== url));
      await loadCompare();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeListing(listingId) {
    setBusy(true);
    setError("");
    try {
      await api(`/api/products/${productId}/listings/${listingId}`, { method: "DELETE" });
      setDecideId(null);
      setMatches(null);
      setManualUrl("");
      await loadCompare();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function findAnotherShop(listingId) {
    setBusy(true);
    setError("");
    try {
      await api(`/api/products/${productId}/listings/${listingId}?keep=1`, { method: "DELETE" });
      setDecideId(null);
      await loadCompare();
      const data = await api(`/api/products/${productId}/find-matches`, { method: "POST" });
      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const listings = compare.listings || [];

  return (
    <section className="app-card mt-6 p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#586490]">Compare across platforms</p>
          <h2 className="font-display mt-2 text-2xl font-light tracking-tight">Same product, other shops</h2>
        </div>
        <button type="button" className="btn-ghost rounded-xl px-4 py-2 text-sm" onClick={findMatches} disabled={busy}>
          {busy ? "Searching…" : "Find this on other platforms"}
        </button>
      </div>
      <p className="mt-2 text-sm text-[#b3c0d4]">
        Dropwatch looks on Amazon.in, Amazon.com, Flipkart, Reliance Digital, and Snapdeal. Only listings with a matching
        brand, title, and price are suggested — confirm before we track one.
      </p>

      {listings.length > 0 && (
        <motion.div
          className="mt-5 grid gap-3"
          variants={motionSafe(reduced, staggerContainer)}
          initial="hidden"
          animate="show"
        >
          {listings.map((listing) => {
            const cheapest = listing.id === compare.cheapestId && listings.length > 1;
            const other = listing.id !== Number(productId);
            const deciding = decideId === listing.id;
            return (
              <motion.div
                key={listing.id}
                variants={motionSafe(reduced, scaleIn)}
                className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <a
                  href={listing.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#0c101c]"
                >
                  {listing.image_url ? (
                    <img src={listing.image_url} alt="" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-[#586490]">—</span>
                  )}
                </a>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#586490]">{siteLabel(listing.source_site)}</p>
                  <a href={listing.source_url} target="_blank" rel="noreferrer" className="block truncate text-sm hover:text-white">
                    {listing.name}
                  </a>
                  <p className="mt-1 text-xs text-[#586490]">
                    Last checked {relativeTime(listing.history?.at(-1)?.checked_at) || "just now"}
                  </p>
                  {other && !deciding && (
                    <button
                      type="button"
                      className="mt-1 text-[11px] text-[#ff5c7a] hover:underline"
                      disabled={busy}
                      onClick={() => setDecideId(listing.id)}
                    >
                      Not the same product
                    </button>
                  )}
                  {deciding && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[#ff5c7a]/40 px-2.5 py-1 text-[11px] text-[#ff5c7a]"
                        disabled={busy}
                        onClick={() => removeListing(listing.id)}
                      >
                        Remove this listing
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-white/15 px-2.5 py-1 text-[11px] text-[#b3c0d4]"
                        disabled={busy}
                        onClick={() => findAnotherShop(listing.id)}
                      >
                        Find another shop
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 text-[11px] text-[#586490] hover:text-white"
                        disabled={busy}
                        onClick={() => setDecideId(null)}
                      >
                        Keep it
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-light tracking-tight">
                    {format(listing.currentPrice, listing.currency)}
                  </p>
                  {cheapest && (
                    <span className="mt-1 inline-block rounded-full bg-[#3ee0a0]/16 px-2 py-0.5 text-[10px] font-semibold text-[#3ee0a0]">
                      Cheapest
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {listings.length > 1 && <CompareChart listings={listings} />}

      {matches && (
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#586490]">Possible matches</p>
            <button type="button" className="text-[11px] text-[#586490] hover:text-white" onClick={() => setMatches(null)}>
              Hide suggestions
            </button>
          </div>
          {matches.length === 0 && (
            <p className="text-sm text-[#586490]">No other listings found.</p>
          )}
          {matches.map((item) => (
            <div key={item.url} className="flex items-center gap-3 rounded-2xl border border-white/8 px-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#586490]">{siteLabel(item.sourceSite)} · {Math.round(item.score * 100)}% match</p>
                <p className="truncate text-sm">{item.name}</p>
                <p className="mt-1 font-display text-lg font-light">{format(item.price, item.currency)}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  className="btn-primary rounded-xl px-3 py-2 text-xs"
                  disabled={busy}
                  onClick={() => confirm(item.url)}
                >
                  Yes, same product
                </button>
                <button
                  type="button"
                  className="text-[11px] text-[#586490] hover:text-white"
                  disabled={busy}
                  onClick={() =>
                    setMatches((list) => {
                      const next = (list || []).filter((row) => row.url !== item.url);
                      return next.length ? next : null;
                    })
                  }
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {matches != null && (
      <form
        className="mt-5 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (manualUrl.trim()) confirm(manualUrl.trim());
        }}
      >
        <input
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Or paste a product URL from any shop"
          className="h-11 flex-1 px-3"
        />
        <button className="btn-ghost rounded-xl px-4 py-2 text-sm" disabled={busy || !manualUrl.trim()}>
          Track this listing
        </button>
      </form>
      )}
      {error && <p className="mt-3 text-sm text-[#ff5c7a]">{error}</p>}
    </section>
  );
}
