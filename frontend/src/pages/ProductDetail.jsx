import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PriceChart from "../components/PriceChart.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { money, pct, siteLabel } from "../lib/format.js";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await api(`/api/products/${id}`);
    setProduct(data.product);
    setTarget(data.product.targetPrice ?? "");
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [id]);

  async function saveAlert(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data = await api(`/api/products/${id}`, {
        method: "PATCH",
        body: { targetPrice: target },
      });
      setProduct(data.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleWhatsApp(next) {
    const data = await api(`/api/products/${id}`, {
      method: "PATCH",
      body: { whatsappAlerts: next },
    });
    setProduct(data.product);
  }

  async function remove() {
    if (!confirm("Stop tracking this product?")) return;
    await api(`/api/products/${id}`, { method: "DELETE" });
    nav("/app");
  }

  if (!product) {
    return <p className="text-sm text-[#71717a]">{error || "Loading…"}</p>;
  }

  const down = (product.change ?? 0) <= 0;

  return (
    <div className="max-w-4xl">
      <Link to="/app" className="text-sm text-[#a1a1aa] hover:text-white">
        ← Dashboard
      </Link>
      <div className="mt-6 grid gap-6 md:grid-cols-[200px_1fr]">
        <div className="card grid aspect-square place-items-center overflow-hidden bg-[#0a0a0c] p-4">
          {product.image_url ? (
            <img src={product.image_url} alt="" className="max-h-full object-contain" />
          ) : (
            <span className="text-xs text-[#71717a]">No image</span>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#71717a]">{siteLabel(product.source_site)}</p>
          <h1 className="mt-1 text-2xl font-bold">{product.name}</h1>
          <div className="mt-4 flex items-end gap-4">
            <p className="text-4xl font-extrabold">{money(product.currentPrice)}</p>
            <p className={`pb-1 font-medium ${down ? "text-[#00d97e]" : "text-[#ff5c7a]"}`}>
              {down ? "↓" : "↑"} {pct(product.changePct)}
            </p>
          </div>
          <a href={product.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-[#4f8cff]">
            View on {siteLabel(product.source_site)} ↗
          </a>
        </div>
      </div>

      <div className="mt-8">
        <PriceChart history={product.history} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-[#71717a]">Lowest recorded</p>
          <p className="mt-2 text-2xl font-bold">{money(product.low)}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-[#71717a]">Highest recorded</p>
          <p className="mt-2 text-2xl font-bold">{money(product.high)}</p>
        </div>
      </div>

      <form onSubmit={saveAlert} className="card mt-6 p-5">
        <h2 className="font-semibold">Set alert price</h2>
        <p className="mt-1 text-sm text-[#a1a1aa]">We’ll email you when the price drops to this or below.</p>
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="h-11 flex-1 px-3"
            placeholder="e.g. 199.00"
          />
          <button className="btn-primary px-5 text-sm" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        {product.targetPrice && (
          <p className="mt-2 text-xs text-[#71717a]">Current target: {money(product.targetPrice)}</p>
        )}
        {error && <p className="mt-2 text-sm text-[#ff5c7a]">{error}</p>}
        <label className="mt-5 flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={Boolean(product.whatsappAlerts)}
            disabled={!user?.whatsappConnected}
            onChange={(e) => toggleWhatsApp(e.target.checked)}
          />
          <span className={user?.whatsappConnected ? "" : "text-[#71717a]"}>
            Also alert me on WhatsApp {user?.whatsappConnected ? "" : "(connect in Settings first)"}
          </span>
        </label>
      </form>

      <button onClick={remove} className="mt-6 text-sm text-[#ff5c7a] hover:underline">
        Stop tracking
      </button>
    </div>
  );
}
