import { useEffect, useState } from "react";
import { Download, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import AddProductBar from "../components/AddProductBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSearch } from "../context/SearchContext.jsx";
import { api, getToken } from "../lib/api.js";
import { matchesQuery } from "../lib/format.js";
import { fadeInUp, motionSafe, staggerContainer } from "../lib/motion.js";
import { atProductLimit, FREE_PRODUCT_LIMIT, isPlus } from "../lib/plans.js";

export default function Products() {
  const { user } = useAuth();
  const { query } = useSearch();
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const reduced = useReducedMotion();
  const visible = products.filter((p) => matchesQuery(p, query));
  const capped = atProductLimit(user, products.length);
  const plus = isPlus(user);

  async function load() {
    const data = await api("/api/products");
    setProducts(data.products);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  return (
    <motion.div variants={motionSafe(reduced, fadeInUp)} initial="hidden" animate="show">
      <p className="mb-5 max-w-xl text-sm leading-6 text-[#b3c0d4]">
        {plus
          ? "Everything you’re watching, in one list. Paste another URL anytime, or export the history."
          : `Free includes ${FREE_PRODUCT_LIMIT} products, email alerts, and the bookmarklet. Compare and export are on Plus.`}
      </p>
      {plus && (
        <div className="mb-4">
          <button
            type="button"
            onClick={async () => {
              setExportError("");
              setExporting(true);
              try {
                const res = await fetch("/api/account/export", {
                  headers: { Authorization: `Bearer ${getToken()}` },
                });
                if (!res.ok) {
                  const data = await res.json().catch(() => ({}));
                  throw new Error(data.error || "Could not export");
                }
                const blob = await res.blob();
                const href = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = href;
                a.download = "dropwatch-history.csv";
                a.click();
                URL.revokeObjectURL(href);
              } catch (err) {
                setExportError(err.message);
              } finally {
                setExporting(false);
              }
            }}
            className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
            disabled={exporting}
          >
            <Download size={15} />
            {exporting ? "Exporting…" : "Export history"}
          </button>
          {exportError && <p className="mt-2 text-sm text-[#ff5c7a]">{exportError}</p>}
        </div>
      )}
      <div className="app-card p-5 md:p-6">
        {capped ? (
          <div>
            <p className="text-sm text-[#b3c0d4]">
              You’ve reached the free limit of {FREE_PRODUCT_LIMIT} products. Upgrade to Plus for unlimited tracking.
            </p>
            <Link to="/app/settings#plan" className="btn-primary mt-4 inline-block px-5 py-2.5 text-sm">
              Upgrade to Plus
            </Link>
          </div>
        ) : (
          <AddProductBar
            busy={busy}
            onAdd={async (url) => {
              setBusy(true);
              try {
                const data = await api("/api/products", { method: "POST", body: { url } });
                setJustAdded(data.product.id);
                window.setTimeout(() => setJustAdded(null), 1600);
                await load();
              } finally {
                setBusy(false);
              }
            }}
          />
        )}
        {!plus && products.length > 0 && !capped && (
          <p className="mt-3 text-xs text-[#586490]">
            {products.length} of {FREE_PRODUCT_LIMIT} free products
          </p>
        )}
      </div>
      {loading ? (
        <p className="mt-10 text-sm text-[#586490]">Loading products…</p>
      ) : visible.length === 0 ? (
        <div className="app-card mt-8 px-6 py-14 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#ff488b]/12 text-[#ff488b]">
            <Package size={22} />
          </div>
          <p className="font-display text-2xl font-light tracking-tight">
            {query ? "No matching products" : "No products yet"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#b3c0d4]">
            {query ? "Try a different name or store." : "Add a URL above and it will show up here with price history."}
          </p>
        </div>
      ) : (
        <motion.div
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          variants={motionSafe(reduced, staggerContainer)}
          initial="hidden"
          animate="show"
        >
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} highlight={justAdded === p.id} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
