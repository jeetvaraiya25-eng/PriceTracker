import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { formatMoney } from "../lib/format.js";

export default function PriceChart({ history = [], sourceCurrency = "USD" }) {
  const { convert, currency } = useCurrency();
  const data = history.map((h) => ({
    t: new Date(h.checked_at.replace(" ", "T") + "Z").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    price: convert(h.price, sourceCurrency),
  }));

  if (!data.length) {
    return (
      <div className="app-card grid h-64 place-items-center text-sm text-[#586490]">
        Price history will appear after the first checks.
      </div>
    );
  }

  return (
    <div className="app-card h-72 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff488b" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#ff488b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="t" tick={{ fill: "#586490", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: "#586490", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatMoney(v, currency)}
            width={currency === "INR" ? 88 : 72}
            domain={["auto", "auto"]}
          />
          <Tooltip
            cursor={{ stroke: "#ff488b", strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{ background: "#161b2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}
            labelStyle={{ color: "#b3c0d4" }}
            formatter={(v) => [formatMoney(v, currency), "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#ff488b"
            strokeWidth={2}
            fill="url(#priceFill)"
            dot={{ r: 3, fill: "#ff488b", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#fff", stroke: "#ff488b", strokeWidth: 2 }}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
