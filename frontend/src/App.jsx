import { Menu } from "lucide-react";
import { useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Sidebar, { MobileNav } from "./components/Sidebar.jsx";
import { useAuth } from "./context/AuthContext.jsx";
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
            <AppShell />
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
    return <div className="grid min-h-screen place-items-center text-sm text-[#71717a]">Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <div className="hidden md:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
      <div className="min-h-screen pb-20 md:pb-0">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-white/5">
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold">Dropwatch</span>
          <span className="w-8" />
        </div>
        <main className="px-5 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
