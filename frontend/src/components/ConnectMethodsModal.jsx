import { Bookmark, Mail, Puzzle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BookmarkletButton from "./BookmarkletButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiPublicUrl } from "../lib/api.js";
import { bookmarkletHref } from "../lib/format.js";
import { isPlus } from "../lib/plans.js";

const tabs = [
  { id: "bookmarklet", label: "Bookmarklet", icon: Bookmark },
  { id: "extension", label: "Extension", icon: Puzzle },
  { id: "email", label: "Email", icon: Mail },
];

export default function ConnectMethodsModal({ open, onClose, initial = "bookmarklet" }) {
  const { token, user } = useAuth();
  const [tab, setTab] = useState(initial);
  useEffect(() => {
    if (open) setTab(initial);
  }, [open, initial]);
  if (!open) return null;
  const href = bookmarkletHref(token || "", apiPublicUrl());
  const plus = isPlus(user);
  const visibleTabs = plus ? tabs : tabs.filter((t) => t.id !== "extension");
  const active = visibleTabs.some((t) => t.id === tab) ? tab : "bookmarklet";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="app-card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-light tracking-tight">Add products from anywhere</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-[#b3c0d4] hover:bg-white/5">
            <X size={18} />
          </button>
        </div>
        <div className="mb-5 flex gap-2">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${
                active === t.id
                  ? "bg-[#ff488b]/14 text-white shadow-[inset_0_0_0_1px_rgba(255,72,139,0.28)]"
                  : "text-[#b3c0d4] hover:bg-white/5"
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
        {active === "bookmarklet" && (
          <div className="space-y-3 text-sm text-[#b3c0d4]">
            <p>
              Safari’s Favourites sidebar will not run this. Drag the button onto the bookmarks bar at the top of the
              window, or use Chrome. Then click it on a product page.
            </p>
            <BookmarkletButton href={href} />
            <p className="text-xs text-[#586490]">
              Delete the old favourite first if you already saved one. Clicking this pink button on Dropwatch will not add a product.
            </p>
          </div>
        )}
        {plus && active === "extension" && (
          <div className="space-y-3 text-sm text-[#b3c0d4]">
            <p>
              Chrome: load unpacked from <code className="text-white">extension/</code>. Safari: run the Dropwatch Mac
              app from <code className="text-white">safari/Dropwatch</code>, enable the unsigned extension, and set it
              to Allow on Amazon. Paste this token in the toolbar popup, then click Track on the photo (or Track this
              page).
            </p>
            <p>Paste this token in the extension popup:</p>
            <code className="block break-all rounded-xl bg-[#0c101c] p-3 text-xs text-[#f5f5f5]">{token}</code>
            <Link to="/app/settings" onClick={onClose} className="text-[#ff488b] hover:underline">
              Open settings for the full setup
            </Link>
          </div>
        )}
        {active === "email" && (
          <div className="space-y-3 text-sm text-[#b3c0d4]">
            <p>
              Drop alerts go to <span className="text-white">{user?.email}</span>. Set a target price on a product and
              we’ll email you when it falls to that amount.
            </p>
            <p>No extra app or phone number. Anyone who signs up can get alerts.</p>
            <Link to="/app/settings#alerts" onClick={onClose} className="text-[#ff488b] hover:underline">
              Open email alert settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
