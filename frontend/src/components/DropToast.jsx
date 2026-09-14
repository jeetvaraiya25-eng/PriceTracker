import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export default function DropToast() {
  const reduced = useReducedMotion();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    function onAlert(event) {
      const item = event.detail;
      if (!item?.name) return;
      setToast(item);
    }
    window.addEventListener("dropwatch:alert", onAlert);
    return () => window.removeEventListener("dropwatch:alert", onAlert);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id || toast.name}
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: -16, x: 12 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduced ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-4 top-4 z-50 max-w-sm rounded-2xl border border-[#ff488b]/35 bg-[#161b2e] px-4 py-3 text-sm shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
        >
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#3ee0a0]">Price dropped</p>
          <p className="mt-1 font-medium text-white">{toast.name}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
