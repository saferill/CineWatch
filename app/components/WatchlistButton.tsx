"use client";

import { useWatchlist, WatchlistItem } from "@/app/hooks/useWatchlist";
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";

interface WatchlistButtonProps {
  id: number;
  type: "movie" | "tv" | "anime";
  title: string;
  poster: string;
}

export default function WatchlistButton({ id, type, title, poster }: WatchlistButtonProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const active = isInWatchlist(id, type);

  const toggle = () => {
    if (active) {
      removeFromWatchlist(id, type);
    } else {
      addToWatchlist({ id, type, title, poster, addedAt: Date.now() });
    }
  };

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
        active
          ? "bg-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          : "glass text-zinc-300 hover:text-white hover:bg-white/10"
      }`}
      title={active ? "Remove from List" : "Add to List"}
    >
      {active ? (
        <IconBookmarkFilled className="w-5 h-5" />
      ) : (
        <IconBookmark className="w-5 h-5" stroke={1.5} />
      )}
    </button>
  );
}
