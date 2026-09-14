import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "./api.js";

const SEEN_KEY = "dropwatch_seen_alert";
const TOAST_KEY = "dropwatch_toast_alert";

export function useAlertWatch() {
  const { pathname } = useLocation();
  const [unread, setUnread] = useState(0);
  const [ring, setRing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await api("/api/account/alerts");
        const events = data.events || [];
        const latest = Number(events[0]?.id || 0);
        const seen = Number(localStorage.getItem(SEEN_KEY) || 0);

        if (pathname.startsWith("/app/alerts")) {
          if (latest) localStorage.setItem(SEEN_KEY, String(latest));
          if (!cancelled) {
            setUnread(0);
            setRing(false);
          }
          return;
        }

        if (!seen && latest) {
          localStorage.setItem(SEEN_KEY, String(latest));
          sessionStorage.setItem(TOAST_KEY, String(latest));
          return;
        }

        const fresh = events.filter((event) => Number(event.id) > seen);
        if (cancelled) return;
        setUnread(fresh.length);
        const newest = fresh[0];
        const lastToast = Number(sessionStorage.getItem(TOAST_KEY) || 0);
        if (newest && Number(newest.id) > lastToast) {
          sessionStorage.setItem(TOAST_KEY, String(newest.id));
          window.dispatchEvent(new CustomEvent("dropwatch:alert", { detail: newest }));
          setRing(true);
          window.setTimeout(() => {
            if (!cancelled) setRing(false);
          }, 500);
        }
      } catch {
        /* ignore polling errors */
      }
    }

    poll();
    const timer = window.setInterval(poll, 40000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pathname]);

  return { unread, ring };
}
