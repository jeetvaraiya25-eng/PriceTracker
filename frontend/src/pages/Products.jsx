import { useEffect, useState } from "react";
import AddProductBar from "../components/AddProductBar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { api } from "../lib/api.js";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    const data = await api("/api/products");
    setProducts(data.products);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Tracked products</h1>
      <div className="mt-6 max-w-3xl">
        <AddProductBar
          busy={busy}
          onAdd={async (url) => {
            setBusy(true);
            try {
              await api("/api/products", { method: "POST", body: { url } });
              await load();
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
