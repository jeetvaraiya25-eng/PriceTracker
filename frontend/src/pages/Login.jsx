import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const afterAuth = searchParams.get("plan") === "plus" ? "/signup?plan=plus" : "/app";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={afterAuth} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/auth/login", { method: "POST", body: { email, password }, token: null });
      login(data.token, data.user);
      nav(afterAuth);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const ready = email.includes("@") && password.length >= 8;

  return (
    <AuthShell title="Welcome back">
        <SocialButtons prefix="Log In" />
      <OrDivider />
      <form onSubmit={submit} className="space-y-3">
        <AuthField placeholder="Email" type="email" value={email} onChange={setEmail} />
        <AuthField placeholder="Password" type="password" value={password} onChange={setPassword} />
        {error && <p className="pt-2 text-sm text-[#ff5c7a]">{error}</p>}
        <button type="submit" className="auth-submit mt-5" disabled={busy || !ready}>
          {busy ? "Signing in…" : "Log In"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-[#586490]">
        No account?{" "}
        <Link to="/signup" className="text-[#ff488b] hover:underline">
          Get started for free
        </Link>
      </p>
    </AuthShell>
  );
}

export function Signup() {
  const { user, login, savePlan, loading } = useAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("plan") === "plus" ? "plus" : "free";
  const [plan, setPlan] = useState(requested);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPlan(searchParams.get("plan") === "plus" ? "plus" : "free");
  }, [searchParams]);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        if (requested === "plus" && user.plan !== "plus") {
          await savePlan("plus");
        }
        if (!cancelled) nav("/app", { replace: true });
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loading, user, requested, savePlan, nav]);

  if (user && error) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#101421] px-5 text-center">
        <div>
          <p className="text-sm text-[#ff5c7a]">{error}</p>
          <Link to="/app/settings#plan" className="mt-4 inline-block text-sm text-[#ff488b] hover:underline">
            Open plan settings
          </Link>
        </div>
      </div>
    );
  }

  if (loading || user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#101421] text-sm text-[#586490]">
        {requested === "plus" ? "Turning on Plus…" : "Taking you to your watchlist…"}
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: { username, email, password, plan },
        token: null,
      });
      login(data.token, data.user);
      nav("/app");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const ready = username.trim().length >= 2 && email.includes("@") && password.length >= 8;
  const plus = plan === "plus";

  return (
    <AuthShell title={plus ? "Start Plus" : "Get started for free"}>
        <div className="mb-6 grid grid-cols-2 gap-2">
          {[
            { id: "free", label: "Free", hint: "10 products" },
            { id: "plus", label: "Plus", hint: "Unlimited" },
          ].map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPlan(option.id)}
              className={`rounded-xl border px-3 py-3 text-left ${
                plan === option.id
                  ? "border-[#ff488b]/60 bg-[#ff488b]/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <p className="text-sm font-semibold text-white">{option.label}</p>
              <p className="mt-0.5 text-xs text-[#8b93b3]">{option.hint}</p>
            </button>
          ))}
        </div>
        {plus && (
          <p className="mb-6 text-sm leading-6 text-[#b3c0d4]">
            Plus is ₹999/mo: unlimited tracking, shop compare, extension, export, and priority support.
          </p>
        )}
        <SocialButtons prefix="Sign Up" />
      <OrDivider />
      <form onSubmit={submit}>
        <AuthField placeholder="Username" value={username} onChange={setUsername} autoComplete="username" required />
        <AuthField className="mt-3" placeholder="Work email" type="email" value={email} onChange={setEmail} />
        <AuthField className="mt-3" placeholder="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
        {error && <p className="mt-3 text-sm text-[#ff5c7a]">{error}</p>}
        <button type="submit" className="auth-submit mt-5" disabled={busy || !ready}>
          {busy ? "Creating…" : plus ? "Create Plus account" : "Sign Up"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-[#586490]">
        Already have an account?{" "}
        <Link to={plus ? "/login?plan=plus" : "/login"} className="text-[#ff488b] hover:underline">
          Log In
        </Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, children }) {
  return (
    <div className="flex min-h-screen justify-center bg-[#101421] px-5 pb-16 pt-14">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="flex justify-center">
          <Logo large />
        </Link>
        <h1 className="font-display mb-8 mt-10 text-[32px] font-light tracking-tight text-white">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function SocialButtons({ prefix }) {
  return (
    <div className="space-y-3">
      <button type="button" className="auth-social">
        <GitHubMark />
        {prefix} With GitHub
      </button>
      <button type="button" className="auth-social">
        <GoogleMark />
        {prefix} With Google
      </button>
    </div>
  );
}

function OrDivider() {
  return (
    <div className="my-7 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.18em] text-[#586490]">
      <span className="h-px flex-1 bg-white/10" />
      OR
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function AuthField({ placeholder, type = "text", value, onChange, className = "", autoComplete, required }) {
  const [show, setShow] = useState(false);
  const password = type === "password";
  return (
    <div className={`relative ${className}`}>
      <input
        type={password && show ? "text" : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`auth-field w-full ${password ? "pr-11" : ""}`}
        required={required ?? (type === "email" || type === "password")}
        autoComplete={autoComplete || (password ? "current-password" : type === "email" ? "email" : "on")}
      />
      {password && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#586490] hover:text-white"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}

function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .7 3.7 1.4l2.5-2.4C16.8 3.8 14.6 3 12 3 7.4 3 3.6 6.8 3.6 11.4S7.4 19.8 12 19.8c6.5 0 8.4-4.5 8.4-6.8 0-.5 0-.8-.1-1.2H12z" />
      <path fill="#4285F4" d="M20.4 13c.2-.6.3-1.2.3-1.6 0-.5 0-.8-.1-1.2H12v3.6h5.1" />
      <path fill="#FBBC05" d="M6.9 13.9a5.5 5.5 0 0 1 0-3.4L3.8 8.1a8.4 8.4 0 0 0 0 6.6z" />
      <path fill="#34A853" d="M12 19.8c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.8.6-1.9 1-3.3 1-3.6 0-4.9-2.4-5.1-3.6L3.8 14.7C4.8 17.6 8.1 19.8 12 19.8z" />
    </svg>
  );
}
