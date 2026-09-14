import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { formatMoney } from "../lib/format.js";

const COLORS = ["#ff488b", "#3ee0a0", "#7aa2ff", "#f5c16c"];

export default function CompareChart({ listings = [] }) {
  const { convert, currency } = useCurrency();
  const series = listings.map((listing, index) => ({
    id: `p${listing.id}`,
    name: listing.source_site?.replace(/^www\./, "") || `Shop ${index + 1}`,
    color: COLORS[index % COLORS.length],
    currency: listing.currency || "USD",
    history: listing.history || [],
  }));

  const dates = new Map();
  series.forEach((line) => {
    line.history.forEach((point) => {
      const key = String(point.checked_at).slice(0, 10);
      if (!dates.has(key)) dates.set(key, { day: key });
      dates.get(key)[line.id] = convert(point.price, line.currency);
    });
  });

  const data = [...dates.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([, row]) => ({
      ...row,
      t: new Date(`${row.day}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));

  if (!data.length) return null;

  return (
    <div className="app-card mt-4 h-72 p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
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
            contentStyle={{ background: "#161b2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}
            labelStyle={{ color: "#b3c0d4" }}
            formatter={(v, name) => [formatMoney(v, currency), name]}
          />
          {series.map((line) => (
            <Line
              key={line.id}
              type="monotone"
              dataKey={line.id}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
