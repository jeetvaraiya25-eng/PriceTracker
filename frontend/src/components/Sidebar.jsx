import { Bell, LayoutGrid, LogOut, Package, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/app", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/app/products", label: "Tracked Products", icon: Package },
  { to: "/app/alerts", label: "Alerts", icon: Bell },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function Item({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
          isActive ? "bg-white/8 text-white" : "text-[#a1a1aa] hover:bg-white/5 hover:text-white"
        }`
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
}

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  return (
    <aside className="flex h-full flex-col border-r border-white/8 bg-[#0d0d0f] px-3 py-4">
      <div className="px-2 pb-6">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {links.map((l) => (
          <Item key={l.to} {...l} onClick={onNavigate} />
        ))}
      </nav>
      <div className="border-t border-white/8 px-2 pt-4">
        <p className="truncate text-xs text-[#71717a]">{user?.email}</p>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#a1a1aa] hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-white/8 bg-[#0d0d0f]/95 px-2 py-2 backdrop-blur md:hidden">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 rounded-lg py-1 text-[10px] ${isActive ? "text-[#4f8cff]" : "text-[#71717a]"}`
          }
        >
          <Icon size={18} />
          {label.split(" ")[0]}
        </NavLink>
      ))}
    </nav>
  );
}
