function Mark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M3.5 19.5h9.2L16.8 6.5 28.5 26"
        stroke="#ff488b"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.4 20.2 28.5 26l-3.2-7.4"
        stroke="#3ee0a0"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({ compact = false, light = false, large = false }) {
  const word = light ? "text-[#172b76]" : "text-white";
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark size={large ? 40 : 28} />
      {!compact && (
        <span className={`${large ? "text-[28px] font-light" : "text-[17px] font-medium"} tracking-tight ${word}`}>
          Dropwatch
        </span>
      )}
    </span>
  );
}
