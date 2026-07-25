"use client";

import { useState, useEffect } from "react";
import type { Movie, TVShow, AnilistAnime } from "@/lib/legacy/types";

export type WatchlistItem = {
  id: number;
  type: "movie" | "tv" | "anime";
  title: string;
  poster: string;
  addedAt: number;
};

const STORAGE_KEY = "CineWatch_watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Load from localStorage only
  useEffect(() => {
    const loadWatchlist = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setWatchlist(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse watchlist", e);
        }
      }
    };
    loadWatchlist();
  }, []);

  const addToWatchlist = async (item: WatchlistItem) => {
    setWatchlist((prev) => {
      if (prev.some((p) => p.id === item.id && p.type === item.type)) {
        return prev;
      }
      const newWatchlist = [item, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  };

  const removeFromWatchlist = async (id: number, type: "movie" | "tv" | "anime") => {
    setWatchlist((prev) => {
      const newWatchlist = prev.filter((p) => !(p.id === id && p.type === type));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWatchlist));
      return newWatchlist;
    });
  };

  const isInWatchlist = (id: number, type: "movie" | "tv" | "anime") => {
    return watchlist.some((p) => p.id === id && p.type === type);
  };

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
}
