export default function Logo({ compact = false }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-[#17171c]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 8h4.2L9.8 3 13 13" stroke="#4f8cff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.2 11.2 13 13l-1.7-3.6" stroke="#00d97e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {!compact && <span className="text-[15px] font-semibold tracking-tight">Dropwatch</span>}
    </span>
  );
}
