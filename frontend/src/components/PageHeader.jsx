export default function PageHeader({ kicker, title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker && (
          <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/40">{kicker}</p>
        )}
        <h1 className="font-display text-[34px] font-light leading-none tracking-tight md:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mt-3 max-w-xl text-sm leading-6 text-[#b3c0d4]">{subtitle}</p>}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
