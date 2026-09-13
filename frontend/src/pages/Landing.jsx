import { Activity, Bell, Bookmark, Puzzle } from "lucide-react";
import { Link } from "react-router-dom";
import FeatureCard from "../components/FeatureCard.jsx";
import { Footer } from "../components/Hero.jsx";
import Hero from "../components/Hero.jsx";
import Navbar from "../components/Navbar.jsx";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const demo = [
  { t: 1, p: 89 },
  { t: 2, p: 86 },
  { t: 3, p: 84 },
  { t: 4, p: 79 },
  { t: 5, p: 73 },
];

const stores = ["Amazon", "Best Buy", "Walmart", "Target", "eBay", "Apple"];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <Navbar />
      <Hero />

      <section className="border-y border-white/8 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 md:flex-row md:justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-[#71717a]">Works with</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-[#52525b]">
            {stores.map((s) => (
              <span key={s} className="tracking-wide">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-sm font-medium text-[#4f8cff]">Features</p>
        <h2 className="mt-2 max-w-xl text-3xl font-bold tracking-tight md:text-4xl">
          One tracking engine. Four ways in.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Activity size={18} />}
            title="Real-time tracking"
            body="We re-check prices on a schedule and keep a full history so you can see the real trend, not a one-off screenshot."
          />
          <FeatureCard
            icon={<Bell size={18} />}
            title="Smart alerts"
            body="Set a target price. When it drops below, Dropwatch emails you — and can ping WhatsApp if you’ve connected it."
          />
          <FeatureCard
            icon={<Puzzle size={18} />}
            title="One-click add via extension"
            body="A Track this price button appears on product pages. Click it and the item is in your dashboard."
          />
          <FeatureCard
            icon={<Bookmark size={18} />}
            title="Track from anywhere"
            body="Paste a link in the dashboard, drop a bookmarklet, or send a URL to the WhatsApp bot. Same engine."
          />
        </div>
      </section>

      <section id="how" className="border-y border-white/8 bg-[#101014] py-24">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-medium text-[#4f8cff]">How it works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Three steps. That’s the whole product.</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Add a product", d: "Paste a URL, use the bookmarklet, click the extension, or send a link in WhatsApp." },
              { n: "02", t: "We track it", d: "Dropwatch fetches the page, stores the price, and checks again on a schedule." },
              { n: "03", t: "Get notified", d: "When the price crosses your target, you get an email — and WhatsApp if you want it." },
            ].map((s) => (
              <div key={s.n} className="card p-6">
                <p className="text-xs font-semibold tracking-[0.2em] text-[#4f8cff]">{s.n}</p>
                <h3 className="mt-3 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-6 text-[#a1a1aa]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-[#00d97e]">Live drop</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">See the cut. Then buy.</h2>
            <p className="mt-4 text-[#a1a1aa]">
              A stylized look at what a real drop feels like in Dropwatch — history, current price, and a clear savings badge.
            </p>
          </div>
          <div className="card relative p-5">
            <span className="absolute right-5 top-5 rounded-full border border-[#00d97e]/30 bg-[#00d97e]/10 px-3 py-1 text-xs font-semibold text-[#00d97e]">
              Price dropped 18%!
            </span>
            <p className="text-xs uppercase tracking-wide text-[#71717a]">Nike Pegasus 41</p>
            <p className="mt-1 text-lg font-semibold">Men’s Road Running Shoes</p>
            <div className="mt-4 flex items-end gap-3">
              <p className="text-3xl font-bold">$119</p>
              <p className="pb-1 text-sm text-[#71717a] line-through">$145</p>
            </div>
            <div className="mt-4 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demo}>
                  <Area type="monotone" dataKey="p" stroke="#00d97e" strokeWidth={2} fill="#00d97e22" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 text-center sm:grid-cols-4">
          {[
            ["24k+", "Prices tracked"],
            ["8.1k", "Alerts sent"],
            ["40+", "Sites supported"],
            ["4", "Ways to add"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="text-4xl font-extrabold tracking-tight">{n}</p>
              <p className="mt-2 text-sm text-[#71717a]">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 py-24">
        <p className="text-sm font-medium text-[#4f8cff]">Pricing</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Start free. Upgrade when the savings stack.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { name: "Free", price: "$0", items: ["20 tracked products", "Email alerts", "Bookmarklet"] },
            { name: "Pro", price: "$8", items: ["Unlimited products", "WhatsApp + email", "Faster checks", "Browser extension"] },
            { name: "Team", price: "$24", items: ["Shared watchlists", "Priority support", "Export history"] },
          ].map((p, i) => (
            <div key={p.name} className={`card p-6 ${i === 1 ? "border-[#4f8cff]/40" : ""}`}>
              <p className="text-sm text-[#a1a1aa]">{p.name}</p>
              <p className="mt-2 text-4xl font-bold">
                {p.price}
                <span className="text-sm font-normal text-[#71717a]"> /mo</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-[#a1a1aa]">
                {p.items.map((it) => (
                  <li key={it}>· {it}</li>
                ))}
              </ul>
              <Link to="/signup" className={i === 1 ? "btn-primary mt-8 block py-2.5 text-center text-sm" : "btn-ghost mt-8 block py-2.5 text-center text-sm"}>
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden py-24 text-center">
        <div className="pointer-events-none absolute inset-0 cta-glow" />
        <div className="relative mx-auto max-w-2xl px-5">
          <h2 className="text-4xl font-extrabold tracking-tight">Stop refreshing. Start catching drops.</h2>
          <p className="mt-3 text-[#a1a1aa]">Create a free account and paste your first product URL in under a minute.</p>
          <Link to="/signup" className="btn-primary mt-8 inline-block px-8 py-3 text-sm">
            Start tracking for free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
