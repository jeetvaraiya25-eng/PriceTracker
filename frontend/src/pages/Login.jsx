import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/app" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/auth/login", { method: "POST", body: { email, password }, token: null });
      login(data.token, data.user);
      nav("/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to see the products you’re watching.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        {error && <p className="text-sm text-[#ff5c7a]">{error}</p>}
        <button className="btn-primary h-11 w-full text-sm" disabled={busy}>
          {busy ? "Signing in…" : "Log in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#a1a1aa]">
        No account? <Link to="/signup" className="text-[#4f8cff]">Get started</Link>
      </p>
    </AuthShell>
  );
}

export function Signup() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/app" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/auth/register", { method: "POST", body: { email, password }, token: null });
      login(data.token, data.user);
      nav("/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Create your Dropwatch" subtitle="Paste a link. We watch the price. You stop overpaying.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        {error && <p className="text-sm text-[#ff5c7a]">{error}</p>}
        <button className="btn-primary h-11 w-full text-sm" disabled={busy}>
          {busy ? "Creating…" : "Get started"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#a1a1aa]">
        Already tracking? <Link to="/login" className="text-[#4f8cff]">Log in</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="card p-8">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-[#a1a1aa]">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[#a1a1aa]">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full px-3" required />
    </label>
  );
}
