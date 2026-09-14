import { useEffect, useState } from "react";
import { Bell, History } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { useSearch } from "../context/SearchContext.jsx";
import { matchesQuery, relativeTime, siteLabel } from "../lib/format.js";

export default function Alerts() {
  const [data, setData] = useState({ events: [], watching: [] });
  const { format } = useCurrency();
  const { query } = useSearch();

  useEffect(() => {
    api("/api/account/alerts").then(setData);
  }, []);

  const watching = data.watching.filter((p) => matchesQuery(p, query));
  const events = data.events.filter((e) => matchesQuery(e, query));

  return (
    <div>
      <p className="mb-6 max-w-xl text-sm leading-6 text-[#b3c0d4]">
        Fired drops and products you’re watching with a target price.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="app-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Bell size={14} className="text-[#ff488b]" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#586490]">Watching</h2>
          </div>
          <div className="space-y-1">
            {watching.length === 0 && (
              <div className="px-2 py-10 text-center">
                <p className="text-sm text-[#b3c0d4]">No target prices set yet.</p>
                <Link to="/app/products" className="mt-3 inline-block text-sm text-[#ff488b] hover:underline">
                  Set one on a product
                </Link>
              </div>
            )}
            {watching.map((p) => (
              <Link key={p.id} to={`/app/products/${p.id}`} className="flex items-center justify-between gap-4 rounded-2xl px-2 py-3 hover:bg-white/[0.04]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#0c101c] text-[10px] text-[#586490]">
                    {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-contain p-1" /> : siteLabel(p.source_site).slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="mt-0.5 text-xs text-[#586490]">
                      {siteLabel(p.source_site)} · Alert at {format(p.targetPrice, p.currency)}
                    </p>
                  </div>
                </div>
                <p className="shrink-0 font-display text-xl font-light tracking-tight">
                  {format(p.currentPrice, p.currency)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="app-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <History size={14} className="text-[#3ee0a0]" />
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#586490]">History</h2>
          </div>
          <div className="space-y-1">
            {events.length === 0 && (
              <div className="px-2 py-10 text-center">
                <p className="text-sm text-[#b3c0d4]">No alerts have fired yet.</p>
              </div>
            )}
            {events.map((e) => (
              <Link key={e.id} to={`/app/products/${e.product_id}`} className="flex items-center justify-between gap-4 rounded-2xl px-2 py-3 hover:bg-white/[0.04]">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.name}</p>
                  <p className="mt-0.5 text-xs text-[#3ee0a0]">
                    Dropped to {format(e.price, e.currency)} (target {format(e.target_price, e.currency)})
                  </p>
                </div>
                <p className="shrink-0 text-xs text-[#586490]">{relativeTime(e.created_at) || e.created_at}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
