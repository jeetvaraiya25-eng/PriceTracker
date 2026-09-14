import { useEffect, useState } from "react";
import { Bookmark, Check, Download, LogOut, Mail, Puzzle, RefreshCw, Sparkles, User, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api, apiPublicUrl, getToken } from "../lib/api.js";
import { bookmarkletHref } from "../lib/format.js";
import CurrencySelect from "../components/CurrencySelect.jsx";
import BookmarkletButton from "../components/BookmarkletButton.jsx";
import { useCurrency } from "../context/CurrencyContext.jsx";
import { displayName } from "../lib/user.js";
import { scrollToId } from "../lib/scroll.js";
import { isPlus, PLUS_PRICE_INR } from "../lib/plans.js";

export default function Settings() {
  const { user, token, saveUsername, savePlan, logout } = useAuth();
  const { detected, usingLocation, currency, format } = useCurrency();
  const [username, setUsername] = useState(displayName(user));
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameLocked, setNameLocked] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [exporting, setExporting] = useState(false);
  const href = bookmarkletHref(token || "", apiPublicUrl());
  const plus = isPlus(user);

  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const t = window.setTimeout(() => scrollToId(id), 50);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    setUsername(displayName(user));
  }, [user]);

  async function saveUsernameForm(e) {
    e.preventDefault();
    const value = String(new FormData(e.target).get("displayName") || username).trim();
    setUsername(value);
    setProfileError("");
    setProfileMessage("");
    setSavingName(true);
    try {
      await saveUsername(value);
      setProfileMessage("Username saved.");
    } catch (err) {
      setProfileError(err.message || "Could not save username");
    } finally {
      setSavingName(false);
    }
  }

  async function switchPlan(plan) {
    setSavingPlan(true);
    setError("");
    try {
      await savePlan(plan);
      setMessage(plan === "plus" ? "Plus is on for this account." : "Switched to Free.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingPlan(false);
    }
  }

  async function exportHistory() {
    setExporting(true);
    setError("");
    try {
      const res = await fetch("/api/account/export", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Could not export");
      }
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "dropwatch-history.csv";
      a.click();
      URL.revokeObjectURL(href);
      setMessage("Downloaded dropwatch-history.csv");
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  async function checkNow() {
    setChecking(true);
    setError("");
    try {
      const data = await api("/api/products/check-now", { method: "POST" });
      const ok = data.results.filter((r) => r.ok).length;
      setMessage(`Checked ${data.results.length} product(s), ${ok} succeeded.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div>
      <p className="mb-6 max-w-xl text-sm leading-6 text-[#b3c0d4]">
        Plan, currency, bookmarklet, and email alerts.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <section id="plan" className="app-card scroll-mt-6 p-5">
          <SectionTitle icon={Sparkles} title="Plan" />
          <p className="mt-2 text-sm text-[#b3c0d4]">
            You’re on <span className="text-white">{plus ? "Plus" : "Free"}</span>
            {plus
              ? " — unlimited tracking, shop compare, extension, export, and priority support."
              : " — 10 products, email alerts, and the bookmarklet."}
          </p>
          {plus ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportHistory}
                className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
                disabled={exporting}
              >
                <Download size={15} />
                {exporting ? "Exporting…" : "Export history"}
              </button>
              <a
                href={`mailto:support@dropwatch.dev?subject=${encodeURIComponent("Plus support")}&body=${encodeURIComponent(`Account: ${user?.email || ""}`)}`}
                className="btn-ghost inline-flex items-center px-4 py-2 text-sm"
              >
                Priority support
              </a>
              <button
                type="button"
                onClick={() => switchPlan("free")}
                className="px-4 py-2 text-sm text-[#8b93b3] hover:text-white"
                disabled={savingPlan}
              >
                Switch to Free
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-[#586490]">
                Plus is {format(PLUS_PRICE_INR, "INR")}/mo for unlimited products, compare across shops, the browser
                extension, and CSV export.
              </p>
              <button
                type="button"
                onClick={() => switchPlan("plus")}
                className="btn-primary mt-4 px-5 py-2.5 text-sm"
                disabled={savingPlan}
              >
                {savingPlan ? "Upgrading…" : "Upgrade to Plus"}
              </button>
            </div>
          )}
        </section>

        <section className="app-card p-5">
          <SectionTitle icon={User} title="Profile" />
          <p className="mt-2 text-sm text-[#b3c0d4]">{user?.email}</p>
          <form autoComplete="off" onSubmit={saveUsernameForm} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              name="username"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none absolute h-0 w-0 opacity-0"
            />
            <input
              name="displayName"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setProfileMessage("");
                setProfileError("");
              }}
              onMouseDown={() => setNameLocked(false)}
              onFocus={() => setNameLocked(false)}
              readOnly={nameLocked}
              maxLength={24}
              placeholder="Username"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-1p-ignore="true"
              data-lpignore="true"
              data-form-type="other"
              className="h-11 flex-1 px-3"
            />
            <button
              type="submit"
              className={`inline-flex items-center justify-center gap-1.5 rounded-[7px] px-4 py-2 text-sm font-semibold transition ${
                profileMessage
                  ? "bg-[#e8edf4] text-[#172b76]"
                  : "btn-primary"
              }`}
              disabled={savingName || Boolean(profileMessage)}
            >
              {savingName ? (
                "Saving…"
              ) : profileMessage ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </button>
          </form>
          {profileError && <p className="mt-2 text-sm text-[#ff5c7a]">{profileError}</p>}
          <button
            type="button"
            onClick={logout}
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#8b93b3] hover:text-white"
          >
            <LogOut size={15} />
            Log out
          </button>
        </section>

        <section className="app-card p-5">
          <SectionTitle icon={Wallet} title="Currency" />
          <p className="mt-2 text-sm text-[#b3c0d4]">
            Prices follow your location. Right now that’s <span className="text-white">{currency}</span>
            {usingLocation ? ` (detected ${detected})` : " (manual override)"}.
          </p>
          <div className="mt-4 max-w-sm">
            <CurrencySelect />
          </div>
        </section>

        <section className="app-card p-5">
          <SectionTitle icon={Bookmark} title="Bookmarklet" />
          <p className="mt-2 text-sm text-[#b3c0d4]">
            Safari’s Favourites sidebar will not run this. Drag it onto the bookmarks bar at the top of the window, or use
            Chrome, then click it on a product page.
          </p>
          <div className="mt-4">
            <BookmarkletButton href={href} />
          </div>
        </section>

        {plus ? (
          <section className="app-card p-5 md:col-span-2">
            <SectionTitle icon={Puzzle} title="Browser extension" />
            <p className="mt-2 text-sm text-[#b3c0d4]">
              This puts a Track button on the product photo. Safari favourites cannot do that.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#586490]">Chrome</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-[#b3c0d4]">
              <li>
                Open <code className="text-white">chrome://extensions</code>, Developer mode, Load unpacked →{" "}
                <code className="text-[#ff488b]">extension/</code>
              </li>
              <li>Click the Dropwatch icon in the Chrome toolbar, paste this token, Connect</li>
              <li>Open Amazon in Chrome and click Track on the photo</li>
            </ol>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#586490]">Safari</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-[#b3c0d4]">
              <li>
                Open <code className="text-white">safari/Dropwatch/Dropwatch.xcodeproj</code> in Xcode and press Run (this
                opens the Dropwatch Mac app)
              </li>
              <li>Safari → Settings → Advanced → Show features for web developers</li>
              <li>Develop → Allow Unsigned Extensions, then Settings → Extensions → enable Dropwatch</li>
              <li>
                In that same Extensions pane, set permissions to <span className="text-white">Allow</span> on all websites
                (or Amazon / Flipkart)
              </li>
              <li>Click Dropwatch in the Safari toolbar, paste this token, Connect</li>
              <li>
                Open a product in Safari. If there is no pink Track button, click the toolbar icon → Always Allow on This
                Website, then Track this page
              </li>
            </ol>
            <code className="mt-3 block break-all rounded-xl bg-[#0c101c] p-3 text-xs">{token}</code>
          </section>
        ) : (
          <section className="app-card p-5">
            <SectionTitle icon={Puzzle} title="Browser extension" />
            <p className="mt-2 text-sm text-[#b3c0d4]">
              The Track button on Amazon and Flipkart is a Plus feature. Free uses paste-URL and the bookmarklet.
            </p>
            <a href="#plan" className="mt-4 inline-block text-sm text-[#ff488b] hover:underline">
              Upgrade to Plus
            </a>
          </section>
        )}

        <section id="alerts" className="app-card scroll-mt-6 p-5">
          <SectionTitle icon={Mail} title="Email alerts" />
          <p className="mt-3 text-sm text-[#b3c0d4]">
            When a tracked price hits your target, Dropwatch emails{" "}
            <span className="text-white">{user?.email}</span>. That’s the same address you signed up with — no extra
            number or bot to connect.
          </p>
          <p className="mt-2 text-sm text-[#586490]">Set a target on any product page to start watching for a drop.</p>
        </section>

        <section className="app-card p-5">
          <SectionTitle icon={RefreshCw} title="Manual price check" />
          <p className="mt-2 text-sm text-[#b3c0d4]">Run the same job the cron uses, for your products only. Useful while testing.</p>
          <button onClick={checkNow} className="btn-ghost mt-4 px-4 py-2 text-sm" disabled={checking}>
            {checking ? "Checking…" : "Check prices now"}
          </button>
        </section>

        {(message || error) && (
          <div className="md:col-span-2">
            {message && <p className="text-sm text-[#3ee0a0]">{message}</p>}
            {error && <p className="text-sm text-[#ff5c7a]">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#ff488b]/12 text-[#ff488b]">
        <Icon size={15} />
      </span>
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}
