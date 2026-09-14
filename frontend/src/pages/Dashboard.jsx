import { useEffect, useMemo, useState } from "react";
import { Bookmark, Mail, Package, Puzzle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import AddProductBar from "../components/AddProductBar.jsx";
import ConnectMethodsModal from "../components/ConnectMethodsModal.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { useSearch } from "../context/SearchContext.jsx";
import { api } from "../lib/api.js";
import { matchesQuery, relativeTime, siteLabel } from "../lib/format.js";
import { fadeInUp, motionSafe, staggerContainer } from "../lib/motion.js";
import { atProductLimit, FREE_PRODUCT_LIMIT, isPlus } from "../lib/plans.js";
import { displayName, firstName } from "../lib/user.js";

export default function Dashboard() {
  const { user } = useAuth();
  const { format, convert, currency } = useCurrency();
  const { query } = useSearch();
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("url");
  const [justAdded, setJustAdded] = useState(null);
  const [addError, setAddError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const pendingAdd = searchParams.get("add");
  const reduced = useReducedMotion();

  async function load() {
    const [catalog, alerts] = await Promise.all([api("/api/products"), api("/api/account/alerts")]);
    setProducts(catalog.products);
    setEvents(alerts.events || []);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!pendingAdd) return;
    let cancelled = false;
    (async () => {
      setAddError("");
      setBusy(true);
      try {
        const data = await api("/api/products", { method: "POST", body: { url: pendingAdd } });
        if (cancelled) return;
        setJustAdded(data.product.id);
        window.setTimeout(() => setJustAdded(null), 1600);
        await load();
      } catch (err) {
        if (!cancelled) setAddError(err.message || "Could not add that page");
      } finally {
        if (!cancelled) {
          setBusy(false);
          setSearchParams({}, { replace: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pendingAdd, setSearchParams]);

  async function onAdd(url) {
    setBusy(true);
    try {
      const data = await api("/api/products", { method: "POST", body: { url } });
      setJustAdded(data.product.id);
      window.setTimeout(() => setJustAdded(null), 1600);
      await load();
    } finally {
      setBusy(false);
    }
  }

  const visible = products.filter((p) => matchesQuery(p, query));
  const watching = products.filter((p) => p.targetPrice != null).length;
  const dropping = products.filter((p) => (p.change ?? 0) < 0).length;
  const capped = atProductLimit(user, products.length);
  const watchValue = products.reduce((sum, p) => sum + (convert(p.currentPrice, p.currency) || 0), 0);
  const closest = useMemo(() => closestToTarget(products, convert), [products, convert]);
  const methods = [
    { id: "url", label: "Paste URL", icon: Package },
    { id: "bookmarklet", label: "Bookmarklet", icon: Bookmark },
    ...(isPlus(user) ? [{ id: "extension", label: "Extension", icon: Puzzle }] : []),
    { id: "email", label: "Email", icon: Mail },
  ];

  if (loading) {
    return <p className="text-sm text-[#586490]">Loading your watchlist…</p>;
  }

  return (
    <motion.div variants={motionSafe(reduced, fadeInUp)} initial="hidden" animate="show">
      <p className="font-display text-2xl font-light tracking-tight text-white md:text-[28px]">
        Welcome back, {displayName(user) || firstName(user)}
      </p>
      <p className="mt-2 text-sm text-[#b3c0d4]">
        {`${products.length} tracked · ${watching} alert${watching === 1 ? "" : "s"} · ${dropping} falling`}
        {!isPlus(user) && products.length > 0 ? ` · ${products.length} of ${FREE_PRODUCT_LIMIT} free` : ""}
      </p>
      <h2 className="font-display mt-3 max-w-2xl text-4xl font-light tracking-tight md:text-[44px]">
        What will you track today?
      </h2>

      <div className="app-card mt-7 overflow-hidden p-0">
        <div className="flex gap-1 overflow-x-auto border-b border-white/8 px-3 py-2">
          {methods.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                if (id !== "url") setModal(id);
              }}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium ${
                tab === id ? "bg-[#ff488b]/12 text-white" : "text-[#8b93b3] hover:text-white"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
        <div className="px-5 py-4 md:px-6 md:py-5">
          {capped ? (
            <div>
              <p className="text-sm text-[#b3c0d4]">
                Free includes {FREE_PRODUCT_LIMIT} tracked products. Upgrade to Plus for unlimited tracking and shop
                compare.
              </p>
              <Link to="/app/settings#plan" className="btn-primary mt-4 inline-block px-5 py-2.5 text-sm">
                Upgrade to Plus
              </Link>
            </div>
          ) : (
            <AddProductBar onAdd={onAdd} busy={busy} variant="composer" />
          )}
          {pendingAdd && <p className="mt-3 text-sm text-[#b3c0d4]">Adding from bookmarklet…</p>}
          {addError && <p className="mt-3 text-sm text-[#ff5c7a]">{addError}</p>}
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="app-card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#586490]">Watchlist value</p>
          <p className="font-display mt-2 text-[32px] font-light leading-none tracking-tight">
            {format(watchValue, currency)}
          </p>
          <p className="mt-2 text-sm text-[#8b93b3]">
            {products.length} product{products.length === 1 ? "" : "s"} you’re tracking
          </p>
        </div>
        {closest ? (
          <Link to={`/app/products/${closest.product.id}`} className="app-card card-hover block p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ff488b]">Closest to target</p>
            <p className="font-display mt-2 truncate text-2xl font-light tracking-tight">{closest.product.name}</p>
            <p className="mt-2 text-sm text-[#b3c0d4]">
              {format(closest.product.currentPrice, closest.product.currency)} now
              {closest.gap > 0
                ? ` · ${format(closest.gap, currency)} above your target`
                : " · at or below your target"}
            </p>
            <p className={`mt-2 text-sm font-semibold ${closest.gap > 0 ? "text-[#ff9bc4]" : "text-[#3ee0a0]"}`}>
              {closest.gap > 0 ? "Waiting" : "Buy zone"}
            </p>
          </Link>
        ) : (
          <div className="app-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ff488b]">Closest to target</p>
            <p className="mt-3 text-sm leading-6 text-[#b3c0d4]">
              Set a target on a product and we’ll show how close it is to a buy.
            </p>
          </div>
        )}
      </div>

      {products.length > 0 && (
        <div className={`mt-8 grid gap-4 ${events.length > 0 ? "xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]" : ""}`}>
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h3 className="font-display text-2xl font-light tracking-tight">Recently added</h3>
              <Link to="/app/products" className="text-sm text-[#8b93b3] hover:text-white">
                See all
              </Link>
            </div>
            {visible.length === 0 ? (
              <div className="app-card px-6 py-14 text-center">
                <p className="text-sm text-[#b3c0d4]">No matching products. Try a different name or store.</p>
              </div>
            ) : (
              <motion.div
                className="grid gap-4 sm:grid-cols-2"
                variants={motionSafe(reduced, staggerContainer)}
                initial="hidden"
                animate="show"
              >
                {visible.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} highlight={justAdded === p.id} />
                ))}
              </motion.div>
            )}
          </section>

          {events.length > 0 && (
            <aside className="app-card h-fit p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium">Recent drops</h3>
                <Link to="/app/alerts" className="text-xs text-[#8b93b3] hover:text-white">
                  All
                </Link>
              </div>
              <div className="space-y-1">
                {events.slice(0, 6).map((item) => (
                  <Link
                    key={item.id}
                    to={`/app/products/${item.product_id}`}
                    className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-white/[0.04]"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#3ee0a0]/12 text-[11px] font-semibold text-[#3ee0a0]">
                      {siteLabel(item.source_site).slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-[#586490]">
                        Alert fired{item.created_at ? ` · ${relativeTime(item.created_at)}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-[#3ee0a0]">{format(item.price, item.currency)}</p>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      )}

      <ConnectMethodsModal
        key={modal || "closed"}
        open={Boolean(modal)}
        initial={modal || "bookmarklet"}
        onClose={() => setModal(null)}
      />
    </motion.div>
  );
}

function closestToTarget(products, convert) {
  let best = null;
  for (const product of products) {
    if (product.targetPrice == null || product.currentPrice == null) continue;
    const current = convert(product.currentPrice, product.currency);
    const target = convert(product.targetPrice, product.currency);
    if (current == null || target == null) continue;
    const gap = current - target;
    if (!best || Math.abs(gap) < Math.abs(best.gap)) {
      best = { product, gap };
    }
  }
  return best;
}
