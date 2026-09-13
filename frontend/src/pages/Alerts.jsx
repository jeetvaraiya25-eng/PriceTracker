import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { money } from "../lib/format.js";

export default function Alerts() {
  const [data, setData] = useState({ events: [], watching: [] });

  useEffect(() => {
    api("/api/account/alerts").then(setData);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
      <p className="mt-1 text-sm text-[#a1a1aa]">Fired drops and products you’re watching with a target price.</p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-[#71717a]">Watching</h2>
      <div className="mt-3 space-y-2">
        {data.watching.length === 0 && <p className="text-sm text-[#71717a]">No target prices set yet.</p>}
        {data.watching.map((p) => (
          <Link key={p.id} to={`/app/products/${p.id}`} className="card card-hover flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-[#71717a]">Alert at {money(p.targetPrice)}</p>
            </div>
            <p className="shrink-0 text-lg font-bold">{money(p.currentPrice)}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-[#71717a]">History</h2>
      <div className="mt-3 space-y-2">
        {data.events.length === 0 && <p className="text-sm text-[#71717a]">No alerts have fired yet.</p>}
        {data.events.map((e) => (
          <Link key={e.id} to={`/app/products/${e.product_id}`} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{e.name}</p>
              <p className="text-xs text-[#00d97e]">
                Dropped to {money(e.price)} (target {money(e.target_price)})
              </p>
            </div>
            <p className="text-xs text-[#71717a]">{e.created_at}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
