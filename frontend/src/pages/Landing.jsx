import { useEffect } from "react";
import { Activity, Bell, Bookmark, Puzzle } from "lucide-react";
import { Link } from "react-router-dom";
import DropDemo from "../components/DropDemo.jsx";
import FeatureCard from "../components/FeatureCard.jsx";
import { Footer } from "../components/Hero.jsx";
import Hero from "../components/Hero.jsx";
import HowItWorks from "../components/HowItWorks.jsx";
import Navbar from "../components/Navbar.jsx";
import Reveal from "../components/Reveal.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { isPlus } from "../lib/plans.js";
import { scrollToId } from "../lib/scroll.js";

export default function Landing() {
  const { format } = useCurrency();
  const { user } = useAuth();

  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const t = window.setTimeout(() => scrollToId(id), 50);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#101421]">
      <Navbar />
      <div>
        <Hero />

        <div className="relative z-10 rounded-t-[48px] bg-[#f4f6f9]">
        <section id="features" className="light-section py-24 text-[#172b76]">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <Reveal>
              <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
                <p className="max-w-xs text-lg leading-7 text-[#172b76]">
                  Price drops without the refresh cycle
                </p>
                <h2 className="font-display text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
                  Built for shoppers,
                  <br />
                  <span className="text-gradient-pink-on-light">catching every drop</span>
                </h2>
              </div>
            </Reveal>
            <Reveal className="mt-16">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <FeatureCard
                  light
                  icon={<Activity size={18} />}
                  title="Real-time tracking"
                  body="We re-check prices on a schedule and keep a full history so you can see the real trend, not a one-off screenshot."
                />
                <FeatureCard
                  light
                  icon={<Bell size={18} />}
                  title="Smart alerts"
                  body="Set a target price. When it drops below, Dropwatch emails you."
                />
                <FeatureCard
                  light
                  icon={<Bookmark size={18} />}
                  title="Track from anywhere"
                  body="Paste a product URL or drop the bookmarklet. Free includes 10 products and email alerts."
                />
                <FeatureCard
                  light
                  icon={<Puzzle size={18} />}
                  title="Compare shops on Plus"
                  body="Plus unlocks shop compare, unlimited tracking, the browser extension, and history export."
                />
              </div>
            </Reveal>
          </div>
        </section>

        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <DropDemo />
        </Reveal>

        <section id="pricing" className="bg-[#f4f6f9] py-24 text-[#172b76]">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <Reveal>
              <p className="text-sm font-medium text-[#ff488b]">Pricing</p>
              <h2 className="font-display mt-2 text-4xl font-light tracking-tight md:text-5xl">
                Start free. Upgrade when the savings stack.
              </h2>
            </Reveal>
            <Reveal className="mt-12">
              <div className="grid items-stretch gap-4 md:grid-cols-2">
                {[
                  {
                    name: "Free",
                    price: 0,
                    items: ["10 tracked products", "Email alerts", "Bookmarklet"],
                    to: user ? "/app" : "/signup?plan=free",
                    cta: user ? "Open dashboard" : "Get started",
                  },
                  {
                    name: "Plus",
                    price: 999,
                    items: [
                      "Unlimited products",
                      "Compare across shops",
                      "Browser extension",
                      "Export history",
                      "Priority support",
                    ],
                    to: user ? (isPlus(user) ? "/app" : "/signup?plan=plus") : "/signup?plan=plus",
                    cta: user ? (isPlus(user) ? "Open dashboard" : "Upgrade to Plus") : "Get started",
                    featured: true,
                  },
                ].map((p) => (
                  <div
                    key={p.name}
                    className={`card-light flex h-full flex-col p-7 ${
                      p.featured ? "border-[#ff488b]/50 shadow-[inset_0_0_0_1px_rgba(255,72,139,0.2)]" : ""
                    }`}
                  >
                    <p className="text-sm text-[#586490]">{p.name}</p>
                    <p className="mt-2 text-4xl font-semibold">
                      {format(p.price, "INR")}
                      <span className="text-sm font-normal text-[#586490]"> /mo</span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-2 text-sm text-[#586490]">
                      {p.items.map((it) => (
                        <li key={it}>· {it}</li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-8">
                      <Link
                        to={p.to}
                        className={
                          p.featured
                            ? "btn-primary flex h-11 w-full items-center justify-center text-sm"
                            : "btn-ghost-dark flex h-11 w-full items-center justify-center text-sm"
                        }
                      >
                        {p.cta}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </div>
      </div>

      <section className="relative overflow-hidden bg-[#101421] py-24 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="cta-orb absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff488b]/20 blur-3xl" />
        </div>
        <Reveal>
          <div className="relative mx-auto max-w-2xl px-5">
            <h2 className="font-display text-5xl font-light tracking-tight md:text-6xl">
              Stop refreshing.
              <br />
              <span className="text-gradient-pink">Start catching drops.</span>
            </h2>
            <p className="mt-4 text-[#b3c0d4]">Create a free account and paste your first product URL in under a minute.</p>
            <Link
              to={user ? "/app" : "/signup?plan=free"}
              className="btn-primary mt-8 inline-block px-8 py-3 text-sm"
            >
              {user ? "Open dashboard" : "Start tracking for free"}
            </Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
