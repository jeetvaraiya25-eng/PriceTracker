import { useState } from "react";

export default function BookmarkletButton({ href }) {
  const [hint, setHint] = useState(false);
  return (
    <div>
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault();
          setHint(true);
        }}
        className="btn-primary inline-flex cursor-grab px-4 py-2 text-sm"
      >
        + Track with Dropwatch
      </a>
      {hint && (
        <p className="mt-3 text-sm text-[#ff9bc4]">
          Don’t click it here. Safari’s Favourites sidebar also won’t run it. Drag this onto the bookmarks bar at the top
          of the window, or use Chrome — then click it on an Amazon product page.
        </p>
      )}
    </div>
  );
}
