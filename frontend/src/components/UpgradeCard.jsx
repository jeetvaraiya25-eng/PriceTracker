import { Link } from "react-router-dom";

export default function UpgradeCard({ title, body, className = "" }) {
  return (
    <div className={`app-card p-5 md:p-6 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ff488b]">Plus</p>
      <h3 className="font-display mt-2 text-2xl font-light tracking-tight">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-[#b3c0d4]">{body}</p>
      <Link to="/app/settings#plan" className="btn-primary mt-5 inline-block px-5 py-2.5 text-sm">
        Upgrade to Plus
      </Link>
    </div>
  );
}
