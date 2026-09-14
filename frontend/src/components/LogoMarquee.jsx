const stores = ["Amazon", "Best Buy", "Walmart", "Target", "eBay", "Apple"];

export default function LogoMarquee() {
  const row = [...stores, ...stores];
  return (
    <section className="relative overflow-hidden pb-2 pt-1">
      <p className="mb-3 text-center text-[11px] uppercase tracking-[0.22em] text-white/40">Works with product pages like</p>
      <div className="marquee-mask">
        <div className="marquee-track">
          {row.map((s, i) => (
            <span key={`${s}-${i}`} className="px-10 text-lg font-semibold tracking-wide text-white/70">
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
