import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import PriceChart from "../components/PriceChart.jsx";
import CompareSection from "../components/CompareSection.jsx";
import UpgradeCard from "../components/UpgradeCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { pct, siteLabel, currencySymbol, parseMoneyInput, roundMoney } from "../lib/format.js";
import { isPlus } from "../lib/plans.js";
import { useCurrency } from "../context/CurrencyContext.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { format, convert, toSource, currency } = useCurrency();
  const [product, setProduct] = useState(null);
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await api(`/api/products/${id}`);
    setProduct(data.product);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (product?.targetPrice == null) return;
    const shown = convert(product.targetPrice, product.currency || "USD");
    const rounded = roundMoney(shown, currency);
    setTarget(rounded == null ? "" : String(rounded));
  }, [product?.id, product?.targetPrice, product?.currency, currency]);

  async function saveAlert(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved("");
    try {
      const entered = parseMoneyInput(target);
      if (!Number.isFinite(entered) || entered <= 0) {
        throw new Error("Enter a valid target price");
      }
      const displayValue = roundMoney(entered, currency);
      const sourceValue = roundMoney(toSource(displayValue, product.currency || "USD"), product.currency || "USD");
      const data = await api(`/api/products/${id}`, {
        method: "PATCH",
        body: { targetPrice: sourceValue },
      });
      setProduct(data.product);
      setTarget(String(displayValue));
      setSaved(`Saved. We’ll email you if this falls to ${format(sourceValue, product.currency)} or below.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("Stop tracking this product?")) return;
    await api(`/api/products/${id}`, { method: "DELETE" });
    nav("/app");
  }

  if (!product) {
    return <p className="text-sm text-[#586490]">{error || "Loading…"}</p>;
  }

  const down = (product.change ?? 0) <= 0;

  return (
    <div className="max-w-4xl">
      <Link
        to="/app"
        className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-[#b3c0d4] hover:border-white/20 hover:text-white"
      >
        ← Home
      </Link>

      <div className="app-card mt-6 p-5 md:p-6">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] md:items-center">
          <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-[#0c101c] p-4">
            {product.image_url ? (
              <img src={product.image_url} alt="" className="max-h-full object-contain" />
            ) : (
              <span className="text-xs text-[#586490]">No image</span>
            )}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#586490]">{siteLabel(product.source_site)}</p>
            <h1 className="font-display mt-2 text-3xl font-light tracking-tight md:text-4xl">{product.name}</h1>
            <div className="mt-5 flex flex-wrap items-end gap-4">
              <p className="font-display text-5xl font-light leading-none tracking-tight">
                {format(product.currentPrice, product.currency)}
              </p>
              <p className={`pb-1 text-sm font-medium ${down ? "text-[#3ee0a0]" : "text-[#ff5c7a]"}`}>
                {down ? "↓" : "↑"} {pct(product.changePct)}
              </p>
            </div>
            <a href={product.source_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-[#ff488b]">
              View on {siteLabel(product.source_site)} ↗
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <PriceChart history={product.history} sourceCurrency={product.currency} />
      </div>

      {isPlus(user) ? (
        <CompareSection productId={product.id} onRefresh={load} />
      ) : (
        <UpgradeCard
          className="mt-6"
          title="Compare this across shops"
          body="Plus searches Amazon, Flipkart, and more for the same product. Free tracks one listing, with email alerts and the bookmarklet."
        />
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Lowest recorded" amount={product.low} currency={product.currency} />
        <MiniStat label="Highest recorded" amount={product.high} currency={product.currency} />
        <MiniStat
          label="Alert target"
          amount={product.targetPrice}
          currency={product.currency}
          empty="Not set"
        />
      </div>

      <form onSubmit={saveAlert} className="app-card mt-6 p-5 md:p-6">
        <h2 className="font-semibold">Set alert price</h2>
        <p className="mt-1 text-sm text-[#b3c0d4]">
          Current price is {format(product.currentPrice, product.currency)}. We’ll email you when it drops to this target or below — in {currency}.
        </p>
        <div className="mt-4 flex gap-2">
          <label className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-white/10 bg-[#0c101c] px-3 focus-within:border-[#ff488b]/75 focus-within:shadow-[0_0_0_3px_rgba(255,72,139,0.16)]">
            <span className="pr-2 text-sm text-[#586490]">{currencySymbol(currency)}</span>
            <input
              type="text"
              inputMode="decimal"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                setSaved("");
              }}
              className="input-plain h-full min-w-0 flex-1 px-0"
              placeholder={currency === "INR" ? "15000" : "199.00"}
              aria-label={`Target price in ${currency}`}
            />
          </label>
          <button
            type="submit"
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-semibold transition ${
              saved ? "bg-[#e8edf4] text-[#172b76]" : "btn-primary"
            }`}
            disabled={saving || Boolean(saved)}
          >
            {saving ? (
              "Saving…"
            ) : saved ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                Saved
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
        {product.targetPrice != null && (
          <p className="mt-2 text-xs text-[#586490]">
            Watching for {format(product.targetPrice, product.currency)}
            {convert(product.currentPrice, product.currency) != null &&
            convert(product.targetPrice, product.currency) >= convert(product.currentPrice, product.currency)
              ? " — this is at or above the current price, so nothing will fire until it drops further."
              : "."}
          </p>
        )}
        {saved && <p className="mt-2 text-sm text-[#3ee0a0]">{saved}</p>}
        {error && <p className="mt-2 text-sm text-[#ff5c7a]">{error}</p>}
        <div className="mt-5 text-sm text-[#b3c0d4]">
          We’ll email <span className="text-white">{user?.email}</span> when this hits your target.
        </div>
      </form>

      <button onClick={remove} className="mt-6 text-sm text-[#ff5c7a] hover:underline">
        Stop tracking
      </button>
    </div>
  );
}

function MiniStat({ label, amount, currency, empty }) {
  const { format } = useCurrency();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? amount : 0);

  useEffect(() => {
    if (amount == null) {
      setShown(null);
      return;
    }
    if (reduced) {
      setShown(amount);
      return;
    }
    const start = performance.now();
    const from = 0;
    const dur = 600;
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) ** 3;
      setShown(from + (amount - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [amount, reduced]);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="app-card p-5"
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#586490]">{label}</p>
      <p className="font-display mt-2 text-2xl font-light tracking-tight">
        {amount == null ? empty || "—" : format(shown, currency)}
      </p>
    </motion.div>
  );
}
