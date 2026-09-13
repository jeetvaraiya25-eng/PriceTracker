import { useEffect, useState } from "react";
import { Bookmark, Puzzle, MessageCircle } from "lucide-react";
import AddProductBar from "../components/AddProductBar.jsx";
import ConnectMethodsModal from "../components/ConnectMethodsModal.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { api } from "../lib/api.js";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  async function load() {
    const data = await api("/api/products");
    setProducts(data.products);
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  async function onAdd(url) {
    setBusy(true);
    try {
      await api("/api/products", { method: "POST", body: { url } });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-[#a1a1aa]">Paste a product URL — that’s entry point one.</p>
      <div className="mt-6">
        <AddProductBar onAdd={onAdd} busy={busy} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-white/8 bg-[#121216] p-3 text-sm">
        <span className="px-2 py-1 text-[#71717a]">Also add via</span>
        <button onClick={() => setModal("bookmarklet")} className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
          <Bookmark size={13} /> Install bookmarklet
        </button>
        <button onClick={() => setModal("extension")} className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
          <Puzzle size={13} /> Get the extension
        </button>
        <button onClick={() => setModal("whatsapp")} className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
          <MessageCircle size={13} /> Connect WhatsApp
        </button>
      </div>
      {loading ? (
        <p className="mt-10 text-sm text-[#71717a]">Loading your watchlist…</p>
      ) : products.length === 0 ? (
        <div className="card mt-10 p-10 text-center">
          <p className="text-lg font-semibold">Nothing tracked yet</p>
          <p className="mt-2 text-sm text-[#a1a1aa]">Paste a product page URL above. Amazon, Best Buy, and most shops with structured product data work.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      <ConnectMethodsModal open={Boolean(modal)} initial={modal || "bookmarklet"} onClose={() => setModal(null)} />
    </div>
  );
}
