"use client";

import { useEffect, useCallback } from "react";

export interface WatchProgress {
  id: number;
  type: "movie" | "tv" | "anime";
  title: string;
  poster: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  progress: number;
  updatedAt: number;
}

const STORAGE_KEY = "CineWatch_watch_progress";

function getStored(): WatchProgress[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setStored(data: WatchProgress[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export function useWatchProgress() {
  const saveProgress = useCallback((progress: WatchProgress) => {
    const stored = getStored();
    const filtered = stored.filter(
      (p) => !(p.id === progress.id && p.type === progress.type)
    );
    const updated = [progress, ...filtered].slice(0, 20);
    setStored(updated);
  }, []);

  const getProgress = useCallback((): WatchProgress[] => {
    return getStored();
  }, []);

  const clearProgress = useCallback((id: number, type: string) => {
    const stored = getStored();
    const filtered = stored.filter((p) => !(p.id === id && p.type === type));
    setStored(filtered);
  }, []);

  const getLatestByType = useCallback((type: string): WatchProgress | undefined => {
    const stored = getStored();
    return stored.find((p) => p.type === type);
  }, []);

  return { saveProgress, getProgress, clearProgress, getLatestByType };
}

export function WatchProgressProvider({ children }: { children: React.ReactNode }) {
  return children;
}
