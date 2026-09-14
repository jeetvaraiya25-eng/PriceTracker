import { CURRENCIES } from "../lib/format.js";
import { useCurrency } from "../context/CurrencyContext.jsx";

export default function CurrencySelect({ compact = false }) {
  const { currency, setCurrency, detected, usingLocation } = useCurrency();
  return (
    <label className={compact ? "block" : "block text-sm"}>
      {!compact && <span className="mb-1.5 block text-[#b3c0d4]">Display currency</span>}
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className={compact ? "select-pill" : "h-11 w-full px-3"}
        title={usingLocation ? `Detected from your location (${detected})` : "Manually selected"}
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {compact ? c.code : `${c.code} — ${c.label}`}
          </option>
        ))}
      </select>
    </label>
  );
}
