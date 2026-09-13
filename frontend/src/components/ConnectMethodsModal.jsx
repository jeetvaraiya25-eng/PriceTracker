import { Bookmark, Puzzle, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { apiPublicUrl } from "../lib/api.js";
import { bookmarkletHref } from "../lib/format.js";

const tabs = [
  { id: "bookmarklet", label: "Bookmarklet", icon: Bookmark },
  { id: "extension", label: "Extension", icon: Puzzle },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export default function ConnectMethodsModal({ open, onClose, initial = "bookmarklet" }) {
  const { token } = useAuth();
  const [tab, setTab] = useState(initial);
  useEffect(() => {
    if (open) setTab(initial);
  }, [open, initial]);
  if (!open) return null;
  const href = bookmarkletHref(token || "", apiPublicUrl());

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add products from anywhere</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-[#a1a1aa] hover:bg-white/5">
            <X size={18} />
          </button>
        </div>
        <div className="mb-4 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${
                tab === t.id ? "bg-white/10 text-white" : "text-[#a1a1aa] hover:bg-white/5"
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>
        {tab === "bookmarklet" && (
          <div className="space-y-3 text-sm text-[#a1a1aa]">
            <p>Drag this button onto your bookmarks bar. Click it on any product page to track the price.</p>
            <a href={href} className="btn-primary inline-flex cursor-grab px-4 py-2 text-sm">
              + Track with Dropwatch
            </a>
            <p className="text-xs text-[#71717a]">
              Your session token is embedded in the bookmarklet on this device. Don’t share it.
            </p>
          </div>
        )}
        {tab === "extension" && (
          <div className="space-y-3 text-sm text-[#a1a1aa]">
            <p>
              In Chrome open <code className="text-white">chrome://extensions</code>, enable Developer mode, then Load
              unpacked and select the project’s <code className="text-[#4f8cff]">extension/</code> folder.
            </p>
            <p>Paste this token in the extension popup:</p>
            <code className="block break-all rounded-lg bg-[#0a0a0c] p-3 text-xs text-[#f5f5f5]">{token}</code>
            <Link to="/app/settings" onClick={onClose} className="text-[#4f8cff] hover:underline">
              Open settings for the full setup
            </Link>
          </div>
        )}
        {tab === "whatsapp" && (
          <div className="space-y-3 text-sm text-[#a1a1aa]">
            <p>
              Message your Dropwatch WhatsApp number, send <code className="text-white">connect</code>, then enter the
              one-time code in Settings.
            </p>
            <p>After linking, paste any product link in WhatsApp to start tracking — and get drop alerts there too.</p>
            <Link to="/app/settings" onClick={onClose} className="text-[#4f8cff] hover:underline">
              Connect WhatsApp in settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
