import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money } from "../lib/format.js";

export default function PriceChart({ history = [] }) {
  const data = history.map((h) => ({
    t: new Date(h.checked_at.replace(" ", "T") + "Z").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    price: h.price,
  }));

  if (!data.length) {
    return (
      <div className="grid h-64 place-items-center rounded-xl border border-white/8 bg-[#0a0a0c] text-sm text-[#71717a]">
        Price history will appear after the first checks.
      </div>
    );
  }

  return (
    <div className="h-72 rounded-xl border border-white/8 bg-[#0a0a0c] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f8cff" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#4f8cff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="t" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
            width={56}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{ background: "#121216", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}
            labelStyle={{ color: "#a1a1aa" }}
            formatter={(v) => [money(v), "Price"]}
          />
          <Area type="monotone" dataKey="price" stroke="#4f8cff" strokeWidth={2} fill="url(#priceFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
