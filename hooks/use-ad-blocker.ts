"use client";

import { useEffect } from "react";

/**
 * Hook to block popup windows and window hijacking attempts
 * from embed video players without triggering iframe sandbox detectors.
 */
export function useAdBlocker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Backup original window.open
    const originalOpen = window.open;

    // Override window.open to block popup ads
    window.open = function (...args: any[]) {
      console.warn("[CineWatch AdBlocker] Blocked popup attempt:", args[0]);
      return null;
    };

    return () => {
      // Restore original window.open on unmount
      window.open = originalOpen;
    };
  }, []);
}
