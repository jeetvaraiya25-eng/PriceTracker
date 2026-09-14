import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo.jsx";
import CurrencySelect from "./CurrencySelect.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { handleHashJump } from "../lib/scroll.js";

export default function Navbar({ light = false }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const jump = (event, id) => {
    if (pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    handleHashJump(event, id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="shrink-0">
          <Logo light={light} />
        </Link>
        <div className="flex items-center gap-3">
          <nav className="nav-pill hidden items-center rounded-full px-2 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/80 md:flex">
            <a href="#features" className="rounded-full px-3 py-1.5 hover:text-white" onClick={(e) => jump(e, "features")}>
              Features
            </a>
            <a href="#pricing" className="rounded-full px-3 py-1.5 hover:text-white" onClick={(e) => jump(e, "pricing")}>
              Pricing
            </a>
            <a href="#how" className="rounded-full px-3 py-1.5 hover:text-white" onClick={(e) => jump(e, "how")}>
              How it works
            </a>
          </nav>
          <div className="hidden w-32 sm:block">
            <CurrencySelect compact />
          </div>
          {user ? (
            <Link to="/app" className="btn-primary px-4 py-2 text-sm">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden px-3 py-2 text-sm text-white/80 hover:text-white sm:inline">
                Log in
              </Link>
              <Link to="/signup?plan=free" className="btn-primary px-4 py-2 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
