import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import RibbonBackdrop from "./RibbonBackdrop.jsx";
import LogoMarquee from "./LogoMarquee.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { handleHashJump } from "../lib/scroll.js";

export default function Hero() {
  const { user } = useAuth();
  const copyRef = useRef(null);

  useEffect(() => {
    const copy = copyRef.current;
    if (!copy) return;
    const onScroll = () => {
      const fade = Math.min(1, Math.max(0, (window.scrollY - 60) / (window.innerHeight * 0.5)));
      copy.style.opacity = String(1 - fade);
      copy.style.transform = `translate3d(0, ${fade * -24}px, 0)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="sticky top-0 h-[100svh] overflow-hidden">
      <RibbonBackdrop />
      <div ref={copyRef} className="relative flex h-full flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-8 pt-28 md:px-8">
          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <h1 className="hero-copy font-display max-w-3xl text-[52px] font-light leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-[92px]">
              Never overpay
              <br />
              <span className="text-gradient-pink">again</span>
            </h1>
            <div className="hero-copy hero-copy-delay max-w-md pb-2 lg:justify-self-end lg:text-right">
              <p className="text-[16px] leading-7 text-white/90">
                Track any product across the web. Dropwatch watches the price and alerts you the moment it falls — in your local currency.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3 lg:justify-end">
                <Link to={user ? "/app" : "/signup?plan=free"} className="btn-light px-6 py-3 text-[13px] uppercase">
                  {user ? "Open dashboard" : "Try it now"}
                </Link>
                <a href="#how" className="btn-ghost px-6 py-3 text-[13px] uppercase" onClick={(e) => handleHashJump(e, "how")}>
                  See how it works
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 pb-20">
          <LogoMarquee />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { user } = useAuth();
  return (
    <footer className="border-t border-white/8 bg-[#101421]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-5 py-14 md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#b3c0d4]">
            Track prices. Catch drops. Buy when it actually makes sense.
          </p>
        </div>
        <div className="flex gap-16 text-sm text-[#b3c0d4]">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-white">Product</p>
            <div className="flex flex-col gap-2">
              <a href="#features" className="hover:text-white" onClick={(e) => handleHashJump(e, "features")}>Features</a>
              <a href="#pricing" className="hover:text-white" onClick={(e) => handleHashJump(e, "pricing")}>Pricing</a>
              <a href="#how" className="hover:text-white" onClick={(e) => handleHashJump(e, "how")}>How it works</a>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-white">Account</p>
            <div className="flex flex-col gap-2">
              {user ? (
                <Link to="/app" className="hover:text-white">Open dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="hover:text-white">Log in</Link>
                  <Link to="/signup?plan=free" className="hover:text-white">Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 py-5 text-center text-xs text-[#586490]">
        © {new Date().getFullYear()} Dropwatch. All rights reserved.
      </div>
    </footer>
  );
}
