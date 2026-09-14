import { useState } from "react";

const tabs = [
  {
    id: "add",
    label: "Add a product",
    title: "One paste. It’s on the list.",
    body: "Drop a product URL in the dashboard or click the bookmarklet. Plus also adds a Track button on the page.",
    unit: "steps",
    bars: [
      { name: "Dropwatch", value: 18, caption: "Paste the URL once" },
      { name: "Bookmarklet", value: 24, caption: "Track from the bookmarks bar" },
      { name: "Manual checking", value: 92, caption: "Open the tab, again, and again" },
    ],
  },
  {
    id: "track",
    label: "We track it",
    title: "The page gets checked. You don’t.",
    body: "Dropwatch fetches the product page on a schedule, stores the price, and keeps a history so you can see the real trend — not a one-off screenshot.",
    unit: "effort",
    bars: [
      { name: "Scheduled checks", value: 22, caption: "Runs in the background" },
      { name: "Price history", value: 36, caption: "Every check is stored" },
      { name: "Refreshing yourself", value: 100, caption: "You are the cron job" },
    ],
  },
  {
    id: "alert",
    label: "Get notified",
    title: "The drop comes to you.",
    body: "Set a target. When the price crosses it, you get an email.",
    unit: "wait",
    bars: [
      { name: "Email", value: 20, caption: "Pinged when it actually drops" },
      { name: "Dashboard chart", value: 34, caption: "See the cut before you buy" },
      { name: "Noticing too late", value: 96, caption: "Sale ended yesterday" },
    ],
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(tabs[0].id);
  const [hover, setHover] = useState(null);
  const tab = tabs.find((t) => t.id === active) || tabs[0];

  return (
    <section id="how" className="bg-[#f4f6f9] pb-8 pt-8 text-[#172b76]">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="text-sm font-medium text-[#ff488b]">How it works</p>
        <div className="mt-10 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            {tabs.map((item) => {
              const on = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={`block w-full border-b border-[#e6ebf3] py-5 text-left transition ${
                    on ? "text-[#172b76]" : "text-[#c5cde0] hover:text-[#586490]"
                  }`}
                  aria-current={on ? "true" : undefined}
                >
                  <span className="font-display text-3xl font-light tracking-tight md:text-4xl">{item.label}</span>
                  {on && <span className="mt-2 block h-0.5 w-12 bg-[#ff488b]" />}
                </button>
              );
            })}
            <div className="mt-8 max-w-md">
              <h3 className="text-xl font-semibold">{tab.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#586490]">{tab.body}</p>
            </div>
          </div>

          <div className="rounded-[28px] bg-[#101421] p-6 text-white md:p-8">
            <div className="mb-8 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[#586490]">
              <span>Compared to doing it yourself</span>
              <span>{tab.unit}</span>
            </div>
            <div className="space-y-7">
              {tab.bars.map((bar) => (
                <button
                  key={bar.name}
                  type="button"
                  className="block w-full text-left"
                  onMouseEnter={() => setHover(bar.name)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(bar.name)}
                  onBlur={() => setHover(null)}
                >
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium">{bar.name}</p>
                    <p className={`text-sm transition ${hover === bar.name ? "text-white" : "text-[#586490]"}`}>{bar.caption}</p>
                  </div>
                  <div className="h-10 overflow-hidden rounded-md bg-white/5">
                    <div
                      className="h-full rounded-md bg-gradient-to-r from-[#6c1468] via-[#ff488b] to-[#ff9bc4] transition-[width] duration-700 ease-out"
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
            <p className="mt-8 text-xs leading-5 text-[#586490]">
              Hover a bar to highlight it. Switch the steps on the left to compare a different part of the flow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
