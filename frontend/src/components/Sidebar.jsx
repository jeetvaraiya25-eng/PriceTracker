import { Bell, LayoutGrid, LogOut, Package, Settings, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { firstName, initials } from "../lib/user.js";
import { planLabel } from "../lib/plans.js";
import { slideLeft, staggerContainer, motionSafe } from "../lib/motion.js";

const links = [
  { to: "/app", label: "Home", icon: LayoutGrid, end: true, kind: "grid" },
  { to: "/app/products", label: "Watchlist", icon: Package, kind: "box" },
  { to: "/app/alerts", label: "Alerts", icon: Bell, kind: "bell" },
  { to: "/app/settings", label: "Settings", icon: Settings, kind: "gear" },
];

const iconHover = {
  grid: { scale: 1.14 },
  box: { scale: 1.14, y: -2 },
  bell: { scale: 1.14, rotate: [0, -14, 12, -8, 0] },
  gear: { scale: 1.14, rotate: 90 },
};

function Item({ to, label, icon: Icon, end, kind, onClick, ring, unread }) {
  const reduced = useReducedMotion();
  const alerts = kind === "bell";
  const hover = reduced ? { scale: 1, y: 0, rotate: 0 } : iconHover[kind];
  return (
    <motion.div variants={motionSafe(reduced, slideLeft)}>
      <NavLink to={to} end={end} onClick={onClick} className="relative block">
        {({ isActive }) => (
          <motion.span
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
              isActive ? "text-white" : "text-[#b3c0d4] hover:text-white"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={reduced ? undefined : "nav-pill"}
                className="absolute inset-0 rounded-xl bg-[#ff488b]/12 shadow-[inset_0_0_0_1px_rgba(255,72,139,0.22)]"
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative flex items-center gap-3">
              <motion.span
                className="grid h-5 w-5 place-items-center"
                variants={{
                  rest: { scale: 1, y: 0, rotate: 0 },
                  hover,
                  tap: reduced ? { scale: 1, y: 0, rotate: 0 } : { scale: 0.88, y: 0, rotate: 0 },
                }}
                transition={{ duration: kind === "bell" ? 0.4 : 0.15, ease: "easeOut" }}
              >
                <Icon
                  size={18}
                  className={`${isActive ? "text-[#ff488b]" : "text-[#8b93b3] group-hover:text-white"} ${
                    alerts && ring ? "bell-ring" : ""
                  }`}
                />
              </motion.span>
              {label}
              {alerts && unread > 0 && (
                <span className="badge-pop grid h-4 min-w-4 place-items-center rounded-full bg-[#ff488b] px-1 text-[9px] font-semibold text-[#101421]">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </span>
          </motion.span>
        )}
      </NavLink>
    </motion.div>
  );
}

export default function Sidebar({ onNavigate, unread = 0, ring = false }) {
  const { user, logout } = useAuth();
  const reduced = useReducedMotion();
  return (
    <aside className="flex h-full flex-col border-r border-white/8 bg-[#0a0e18] px-3 py-5">
      <div className="flex items-start justify-between gap-2 px-2 pb-8">
        <Logo />
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-lg p-1.5 text-[#586490] hover:bg-white/5 hover:text-white"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#586490]">Workspace</p>
      <motion.nav
        className="flex flex-1 flex-col gap-1"
        variants={motionSafe(reduced, staggerContainer)}
        initial="hidden"
        animate="show"
      >
        {links.map((l) => (
          <Item key={l.to} {...l} onClick={onNavigate} unread={unread} ring={ring} />
        ))}
      </motion.nav>
      <div className="space-y-3 border-t border-white/8 px-1 pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-2.5 py-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#ff488b]/15 text-xs font-semibold text-[#ff488b]">
            {initials(user)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{firstName(user)}</p>
            <p className="truncate text-[11px] text-[#586490]">
              {planLabel(user)} · {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#b3c0d4] hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}

export function MobileNav({ unread = 0, ring = false }) {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/8 bg-[#0c101c]/95 px-2 py-2 backdrop-blur md:hidden">
      {links.map(({ to, label, icon: Icon, end, kind }) => {
        const active = end ? pathname === to : pathname.startsWith(to);
        const alerts = kind === "bell";
        const hover = reduced ? { scale: 1 } : iconHover[kind];
        return (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={`flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] ${active ? "text-[#ff488b]" : "text-[#586490]"}`}
          >
            <motion.span
              className="relative grid h-5 w-5 place-items-center"
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              variants={{
                rest: { scale: 1, y: 0, rotate: 0 },
                hover,
                tap: reduced ? { scale: 1 } : { scale: 0.88 },
              }}
              transition={{ duration: kind === "bell" ? 0.4 : 0.15, ease: "easeOut" }}
            >
              <Icon size={18} className={alerts && ring ? "bell-ring" : ""} />
              {alerts && unread > 0 && (
                <span className="absolute -right-1.5 -top-1 h-1.5 w-1.5 rounded-full bg-[#ff488b]" />
              )}
            </motion.span>
            {label.split(" ")[0]}
          </NavLink>
        );
      })}
    </nav>
  );
}
