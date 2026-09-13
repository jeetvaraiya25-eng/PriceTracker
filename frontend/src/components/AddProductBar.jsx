import { useState } from "react";
import { Plus } from "lucide-react";

export default function AddProductBar({ onAdd, busy }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await onAdd(url.trim());
      setUrl("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a product URL to start tracking"
          className="h-12 flex-1 px-4 text-sm"
        />
        <button type="submit" disabled={busy || !url.trim()} className="btn-primary inline-flex h-12 items-center justify-center gap-2 px-5 text-sm">
          <Plus size={16} />
          {busy ? "Adding…" : "Add product"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-[#ff5c7a]">{error}</p>}
    </form>
  );
}
