"use client";

import { useState, useEffect } from "react";
import type { Movie, TVShow, AnilistAnime } from "@/app/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

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
  const { user } = useAuth();

  // Load from local or Supabase
  useEffect(() => {
    const loadWatchlist = async () => {
      if (user) {
        // Load from Supabase
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id);
        
        if (data && !error) {
          const formattedData: WatchlistItem[] = data.map(item => ({
            id: parseInt(item.media_id),
            type: item.media_type as any,
            title: item.title,
            poster: item.poster_path,
            addedAt: new Date(item.created_at).getTime()
          }));
          setWatchlist(formattedData);
          // Also update local storage for offline use
          localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedData));
        }
      } else {
        // Load from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setWatchlist(JSON.parse(stored));
        }
      }
    };

    loadWatchlist();
  }, [user]);

  const addToWatchlist = async (item: WatchlistItem) => {
    setWatchlist((prev) => {
      if (prev.some((p) => p.id === item.id && p.type === item.type)) {
        return prev;
      }
      const newWatchlist = [item, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWatchlist));
      return newWatchlist;
    });

    if (user) {
      await supabase.from('favorites').insert({
        user_id: user.id,
        media_id: item.id.toString(),
        media_type: item.type,
        title: item.title,
        poster_path: item.poster
      });
    }
  };

  const removeFromWatchlist = async (id: number, type: "movie" | "tv" | "anime") => {
    setWatchlist((prev) => {
      const newWatchlist = prev.filter((p) => !(p.id === id && p.type === type));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newWatchlist));
      return newWatchlist;
    });

    if (user) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('media_id', id.toString())
        .eq('media_type', type);
    }
  };

  const isInWatchlist = (id: number, type: "movie" | "tv" | "anime") => {
    return watchlist.some((p) => p.id === id && p.type === type);
  };

  return { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist };
}
