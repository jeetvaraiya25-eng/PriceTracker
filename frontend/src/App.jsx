import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppHeader from "./components/AppHeader.jsx";
import Sidebar from "./components/Sidebar.jsx";
import DropToast from "./components/DropToast.jsx";
import UsernameSetup from "./components/UsernameSetup.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { SearchProvider } from "./context/SearchContext.jsx";
import { useAlertWatch } from "./lib/alerts.js";
import { displayName } from "./lib/user.js";
import Alerts from "./pages/Alerts.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Landing from "./pages/Landing.jsx";
import Login, { Signup } from "./pages/Login.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Products from "./pages/Products.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <SearchProvider>
              <AppShell />
            </SearchProvider>
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#101421] text-sm text-[#586490]">
        Loading your watchlist…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { unread, ring } = useAlertWatch();

  useEffect(() => {
    if (!open) return;
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-[#0c101c]">
      {open && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative h-full w-[min(18.5rem,86vw)] shadow-[12px_0_40px_rgba(0,0,0,0.35)]">
            <Sidebar onNavigate={() => setOpen(false)} unread={unread} ring={ring} />
          </div>
        </div>
      )}
      <div className="app-canvas flex min-h-screen flex-col">
        <AppHeader onMenu={() => setOpen(true)} unread={unread} />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-5 py-6 md:px-8 md:py-8">
          {displayName(user) ? <Outlet /> : <UsernameSetup />}
        </main>
      </div>
      <DropToast />
    </div>
  );
}
