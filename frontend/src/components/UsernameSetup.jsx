import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function UsernameSetup() {
  const { saveUsername } = useAuth();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const value = String(new FormData(e.target).get("username") || username).trim();
    setUsername(value);
    setBusy(true);
    setError("");
    try {
      await saveUsername(value);
    } catch (err) {
      setError(err.message || "Could not save username");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center">
      <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/40">Your profile</p>
      <h1 className="font-display text-4xl font-light tracking-tight md:text-5xl">Choose a username</h1>
      <p className="mt-3 text-sm leading-6 text-[#b3c0d4]">
        This is how Dropwatch will greet you. You can change it later in Settings.
      </p>
      <form onSubmit={submit} className="app-card mt-8 p-5 md:p-6">
        <label className="block text-sm text-[#b3c0d4]" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="jeet"
          autoComplete="username"
          autoFocus
          maxLength={24}
          className="auth-field mt-2 w-full"
        />
        {error && <p className="mt-3 text-sm text-[#ff5c7a]">{error}</p>}
        <button type="submit" className="auth-submit mt-5" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
