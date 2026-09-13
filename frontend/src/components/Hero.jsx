import { Link } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import Logo from "./Logo.jsx";

const mock = [
  { t: 1, p: 248 },
  { t: 2, p: 241 },
  { t: 3, p: 239 },
  { t: 4, p: 232 },
  { t: 5, p: 228 },
  { t: 6, p: 219 },
  { t: 7, p: 204 },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-dot opacity-70" />
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 text-center md:pt-28">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#a1a1aa]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00d97e]" />
          Price drops, caught automatically
        </p>
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold tracking-tight md:text-7xl">
          Never overpay again
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-[#a1a1aa]">
          Track any product across the web. Dropwatch watches the price and alerts you the moment it falls.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/signup" className="btn-primary px-6 py-3 text-sm">
            Try it now
          </Link>
          <a href="#how" className="btn-ghost px-6 py-3 text-sm">
            See how it works
          </a>
        </div>
        <div className="mx-auto mt-14 max-w-4xl">
          <div className="card overflow-hidden p-3 md:p-5">
            <div className="rounded-lg border border-white/8 bg-[#0a0a0c] p-4 md:p-6">
              <div className="mb-4 flex items-center justify-between text-left">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#71717a]">Tracked product</p>
                  <p className="mt-1 text-lg font-semibold">Sony WH-1000XM5</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">$204.00</p>
                  <p className="text-sm font-medium text-[#00d97e]">↓ 18% this week</p>
                </div>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mock}>
                    <defs>
                      <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f8cff" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#4f8cff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="p" stroke="#4f8cff" strokeWidth={2} fill="url(#heroFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-[#71717a]">
            Track prices. Catch drops. Buy when it actually makes sense.
          </p>
        </div>
        <div className="flex gap-10 text-sm text-[#a1a1aa]">
          <div className="flex flex-col gap-2">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#how" className="hover:text-white">How it works</a>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/login" className="hover:text-white">Log in</Link>
            <Link to="/signup" className="hover:text-white">Get started</Link>
            <a href="https://www.whatsapp.com/" className="hover:text-white" target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 py-5 text-center text-xs text-[#71717a]">
        © {new Date().getFullYear()} Dropwatch. All rights reserved.
      </div>
    </footer>
  );
}
