import { useEffect, useRef } from "react";

export default function RibbonBackdrop() {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let mx = 0;
    let my = 0;
    let sx = 0;
    let sy = 0;
    let frame = 0;
    let live = false;

    const apply = () => {
      sx += (mx - sx) * 0.14;
      sy += (my - sy) * 0.14;
      layer.style.transform = `translate3d(${sx * 40}px, ${sy * 24}px, 0) rotate(${-18 - sx * 6}deg)`;
      if (Math.abs(mx - sx) > 0.001 || Math.abs(my - sy) > 0.001) {
        frame = requestAnimationFrame(apply);
      } else {
        live = false;
      }
    };

    const onMove = (e) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
      if (!live) {
        live = true;
        frame = requestAnimationFrame(apply);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#101421]" />
      <div className="hero-stars absolute inset-0 opacity-35" />
      <div ref={layerRef} className="ribbon-art absolute -right-[18%] -top-[6%] h-[125%] w-[90%]">
        <svg viewBox="0 0 900 1100" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ribA" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3a0a3a" />
              <stop offset="45%" stopColor="#8b1a78" />
              <stop offset="100%" stopColor="#ff6aa8" />
            </linearGradient>
            <linearGradient id="ribB" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a0838" />
              <stop offset="50%" stopColor="#c43d9a" />
              <stop offset="100%" stopColor="#ffe1f2" />
            </linearGradient>
            <linearGradient id="ribC" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#1a0628" />
              <stop offset="40%" stopColor="#6c1468" />
              <stop offset="100%" stopColor="#e33adb" />
            </linearGradient>
          </defs>
          <path
            d="M120 1100 C 80 820, 220 640, 380 520 C 560 380, 620 240, 700 -40"
            stroke="url(#ribC)"
            strokeWidth="150"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M260 1100 C 200 800, 340 620, 520 470 C 700 320, 760 170, 840 -80"
            stroke="url(#ribA)"
            strokeWidth="170"
            fill="none"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M420 1120 C 360 820, 520 640, 680 500 C 840 360, 900 200, 980 -60"
            stroke="url(#ribB)"
            strokeWidth="90"
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M520 1120 C 480 840, 620 680, 760 540 C 900 400, 960 220, 1040 -40"
            stroke="#fff6fb"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      </div>
    </div>
  );
}
