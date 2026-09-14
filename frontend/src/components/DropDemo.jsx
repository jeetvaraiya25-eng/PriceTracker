import { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useCurrency } from "../context/CurrencyContext.jsx";

const series = {
  week: [
    { t: "Mon", p: 145 },
    { t: "Tue", p: 141 },
    { t: "Wed", p: 138 },
    { t: "Thu", p: 132 },
    { t: "Fri", p: 128 },
    { t: "Sat", p: 121 },
    { t: "Sun", p: 119 },
  ],
  month: [
    { t: "W1", p: 149 },
    { t: "W2", p: 144 },
    { t: "W3", p: 136 },
    { t: "W4", p: 119 },
  ],
};

export default function DropDemo() {
  const { format } = useCurrency();
  const [range, setRange] = useState("week");
  const data = series[range];
  const [index, setIndex] = useState(data.length - 1);
  const point = data[Math.min(index, data.length - 1)];
  const start = data[0].p;
  const dropPct = Math.round(((start - point.p) / start) * 100);
  const chartData = useMemo(() => data.map((d, i) => ({ ...d, active: i === index })), [data, index]);

  return (
    <section className="bg-[#f4f6f9] pb-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 md:px-8">
        <div>
          <p className="text-sm font-medium text-[#ff488b]">Price history</p>
          <h2 className="font-display mt-2 text-4xl font-light tracking-tight text-[#172b76] md:text-5xl">
            Drag the graph. Watch the drop.
          </h2>
          <p className="mt-4 max-w-md text-[#586490]">
            This is a sample of how a tracked product looks — not live store data. Hover or drag the slider to move through the history.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl bg-[#101421] p-6 text-white">
          <div className="absolute right-5 top-5 flex gap-2">
            {[
              { id: "week", label: "7 days" },
              { id: "month", label: "30 days" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setRange(tab.id);
                  setIndex(series[tab.id].length - 1);
                }}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  range === tab.id ? "bg-[#ff488b] text-[#101421]" : "bg-white/10 text-white/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="text-xs uppercase tracking-wide text-[#b3c0d4]">Sample product</p>
          <p className="mt-1 text-lg font-semibold">Wireless headphones</p>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-3xl font-semibold">{format(point.p, "USD")}</p>
            <p className="pb-1 text-sm text-[#586490] line-through">{format(start, "USD")}</p>
            <p className="pb-1 text-sm font-medium text-[#3ee0a0]">↓ {dropPct}%</p>
          </div>
          <div className="mt-4 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                onMouseMove={(state) => {
                  if (state?.activeTooltipIndex == null) return;
                  setIndex(state.activeTooltipIndex);
                }}
              >
                <defs>
                  <linearGradient id="dropFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff488b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ff488b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fill: "#586490", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ stroke: "#ff488b", strokeWidth: 1 }}
                  contentStyle={{ background: "#161b2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  formatter={(v) => [format(v, "USD"), "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="p"
                  stroke="#ff488b"
                  strokeWidth={2}
                  fill="url(#dropFill)"
                  dot={{ r: 3, fill: "#ff488b" }}
                  activeDot={{ r: 6, fill: "#fff", stroke: "#ff488b", strokeWidth: 2 }}
                  isAnimationActive
                  animationDuration={700}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <label className="mt-4 block">
            <span className="sr-only">Scrub price history</span>
            <input
              type="range"
              min={0}
              max={data.length - 1}
              value={Math.min(index, data.length - 1)}
              onChange={(e) => setIndex(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-[#ff488b]"
            />
          </label>
          <p className="mt-2 text-xs text-[#586490]">
            {point.t} · {format(point.p, "USD")}
          </p>
        </div>
      </div>
    </section>
  );
}
