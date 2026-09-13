import { Link, useLocation } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const jump = (id) => {
    if (pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0d0d0f]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[#a1a1aa] md:flex">
          <button className="hover:text-white" onClick={() => jump("features")}>
            Features
          </button>
          <button className="hover:text-white" onClick={() => jump("pricing")}>
            Pricing
          </button>
          <button className="hover:text-white" onClick={() => jump("how")}>
            How it works
          </button>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/app" className="btn-primary px-4 py-2 text-sm">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden px-3 py-2 text-sm text-[#a1a1aa] hover:text-white sm:inline">
                Log in
              </Link>
              <Link to="/signup" className="btn-primary px-4 py-2 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
