import { Link } from "react-router-dom";
import { money, pct, siteLabel } from "../lib/format.js";

function Sparkline({ values = [], down }) {
  if (!values.length) return <div className="h-7 w-20" />;
  const w = 84;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const color = down ? "#00d97e" : "#ff5c7a";
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.8" points={pts} />
    </svg>
  );
}

export default function ProductCard({ product }) {
  const down = (product.change ?? 0) <= 0;
  return (
    <Link
      to={`/app/products/${product.id}`}
      className="card card-hover block overflow-hidden"
    >
      <div className="flex aspect-[16/10] items-center justify-center bg-[#0a0a0c]">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="h-full w-full object-contain p-4" />
        ) : (
          <div className="text-xs text-[#71717a]">No image</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] uppercase tracking-wide text-[#71717a]">{siteLabel(product.source_site)}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-medium leading-5">{product.name}</h3>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-bold">{money(product.currentPrice)}</p>
            <p className={`text-xs font-medium ${down ? "text-[#00d97e]" : "text-[#ff5c7a]"}`}>
              {down ? "↓" : "↑"} {pct(product.changePct)}
            </p>
          </div>
          <Sparkline values={product.sparkline || []} down={down} />
        </div>
      </div>
    </Link>
  );
}
