import { Bell, Menu, Search } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import CurrencySelect from "./CurrencySelect.jsx";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSearch } from "../context/SearchContext.jsx";
import { firstName, initials } from "../lib/user.js";

const titles = {
  "/app": "Home",
  "/app/products": "Watchlist",
  "/app/alerts": "Alerts",
  "/app/settings": "Settings",
};

const links = [
  { to: "/app", label: "Home", end: true },
  { to: "/app/products", label: "Watchlist" },
  { to: "/app/alerts", label: "Alerts" },
  { to: "/app/settings", label: "Settings" },
];

export default function AppHeader({ onMenu, unread = 0 }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { query, setQuery } = useSearch();
  const title = pathname.startsWith("/app/products/") ? "Product" : titles[pathname] || "Home";

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/8 bg-[#101421]/80 px-5 py-3.5 backdrop-blur-xl md:px-8">
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-xl p-2 text-[#b3c0d4] hover:bg-white/5 hover:text-white md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <Link to="/app" className="hidden sm:block" aria-label="Dropwatch home">
          <Logo compact />
        </Link>
        <h1 className="font-display text-2xl font-light tracking-tight md:hidden">{title}</h1>
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => {
                const on =
                  isActive || (to === "/app/products" && pathname.startsWith("/app/products/"));
                return `rounded-full px-3 py-1.5 text-sm ${
                  on ? "bg-[#ff488b]/12 text-white" : "text-[#8b93b3] hover:text-white"
                }`;
              }}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <label className="flex h-11 min-w-0 w-full max-w-[280px] items-center gap-2 rounded-full border border-white/10 bg-[#161b2e] px-4">
          <Search size={16} className="shrink-0 text-[#586490]" />
          <input
            value={query}
            onChange={(e) => {
              const next = e.target.value;
              setQuery(next);
              if (
                next &&
                pathname !== "/app" &&
                pathname !== "/app/products" &&
                pathname !== "/app/alerts"
              ) {
                navigate("/app/products");
              }
            }}
            placeholder="Search your watchlist"
            className="input-plain min-w-0 flex-1 text-sm"
          />
        </label>
        <div className="hidden w-[4.75rem] lg:block">
          <CurrencySelect compact />
        </div>
        <Link
          to="/app/alerts"
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-[#161b2e] text-[#b3c0d4] hover:text-white"
          aria-label="Alerts"
        >
          <Bell size={16} />
          {unread > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#ff488b]" />}
        </Link>
        <Link
          to="/app/settings"
          className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[#161b2e] py-1.5 pl-1.5 pr-3"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff488b]/16 text-[11px] font-semibold text-[#ff488b]">
            {initials(user)}
          </span>
          <span className="hidden max-w-[7rem] truncate text-sm text-white lg:block">{firstName(user)}</span>
        </Link>
      </div>
    </header>
  );
}
