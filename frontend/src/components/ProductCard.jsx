import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { pct, relativeTime, siteLabel } from "../lib/format.js";
import { scaleIn, motionSafe } from "../lib/motion.js";

function Sparkline({ values = [], down }) {
  if (!values.length) return <div className="h-7 w-20" />;
  const w = 84;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const d = values
    .map((v, i) => {
      const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const color = down ? "#3ee0a0" : "#ff5c7a";
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        className="spark-line"
      />
    </svg>
  );
}

export default function ProductCard({ product, highlight = false }) {
  const { format, convert, currency } = useCurrency();
  const reduced = useReducedMotion();
  const down = (product.change ?? 0) <= 0;
  const current = convert(product.currentPrice, product.currency);
  const target = product.targetPrice == null ? null : convert(product.targetPrice, product.currency);
  const gap = current != null && target != null ? current - target : null;
  return (
    <motion.div variants={motionSafe(reduced, scaleIn)}>
      <Link
        to={`/app/products/${product.id}`}
        className={`app-card card-hover block overflow-hidden ${highlight ? "card-just-added" : ""}`}
      >
        <div className="relative flex aspect-[16/10] items-center justify-center bg-[#0c101c]">
          {product.image_url ? (
            <img src={product.image_url} alt="" className="h-full w-full object-contain p-5" />
          ) : (
            <div className="text-xs text-[#586490]">No image</div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-[#101421]/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#b3c0d4] backdrop-blur">
            {siteLabel(product.source_site)}
          </span>
          {product.targetPrice != null && (
            <span className="absolute right-3 top-3 rounded-full bg-[#ff488b]/16 px-2.5 py-1 text-[10px] font-semibold text-[#ff9bc4] backdrop-blur">
              Alert set
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium leading-5">{product.name}</h3>
          <p className="mt-1 text-xs text-[#586490]">
            {product.created_at ? `Added ${relativeTime(product.created_at)}` : siteLabel(product.source_site)}
          </p>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-[26px] font-light leading-none tracking-tight">
                {format(product.currentPrice, product.currency)}
              </p>
              <p
                className={`mt-1.5 text-xs font-medium ${down ? "drop-pulse text-[#3ee0a0]" : "text-[#ff5c7a]"}`}
              >
                {down ? "↓" : "↑"} {pct(product.changePct)}
              </p>
              {gap != null && (
                <p className={`mt-1 text-xs ${gap > 0 ? "text-[#8b93b3]" : "text-[#3ee0a0]"}`}>
                  {gap > 0
                    ? `${format(gap, currency)} above target`
                    : "At or below target"}
                </p>
              )}
            </div>
            <Sparkline values={product.sparkline || []} down={down} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
