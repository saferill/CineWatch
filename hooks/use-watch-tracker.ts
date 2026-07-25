import { useEffect, useState, useCallback } from 'react';
import { WatchProgress } from '@/types/watch-progress';

const STORAGE_KEY = 'CineWatch_watch_progress';

export function useWatchTracker(media: Partial<WatchProgress>) {
  const [progress, setProgress] = useState<WatchProgress | null>(null);

  // Load initial progress for this specific media/episode
  useEffect(() => {
    if (!media.id || !media.type) return;
    
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const found = stored.find((p: WatchProgress) => 
        String(p.id) === String(media.id) && 
        p.type === media.type && 
        (media.type === 'movie' || (p.season === media.season && p.episode === media.episode))
      );
      
      if (found) {
        setProgress(found);
      }
    } catch (e) {
      console.error('Failed to load watch progress', e);
    }
  }, [media.id, media.type, media.season, media.episode]);

  const saveProgress = useCallback((update: Partial<WatchProgress>) => {
    if (!media.id || !media.type) return;

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const now = Date.now();
      
      const existingIndex = stored.findIndex((p: WatchProgress) => 
        String(p.id) === String(media.id) && 
        p.type === media.type && 
        (media.type === 'movie' || (p.season === media.season && p.episode === media.episode))
      );

      let baseItem: Partial<WatchProgress> = {};
      if (existingIndex !== -1) {
        baseItem = stored[existingIndex];
      }

      const newItem: WatchProgress = {
        id: media.id,
        type: media.type as any,
        title: media.title || baseItem.title || '',
        poster: media.poster || baseItem.poster || '',
        season: media.season ?? baseItem.season,
        episode: media.episode ?? baseItem.episode,
        episodeTitle: media.episodeTitle || baseItem.episodeTitle,
        currentTime: update.currentTime ?? baseItem.currentTime ?? 0,
        duration: update.duration ?? baseItem.duration ?? 0,
        server: update.server ?? baseItem.server,
        subtitle: update.subtitle ?? baseItem.subtitle,
        updatedAt: now,
        ...update,
      };

      const filtered = stored.filter((_: any, i: number) => i !== existingIndex);
      const updated = [newItem, ...filtered].slice(0, 50);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setProgress(newItem);
    } catch (e) {
      console.error('Failed to save watch progress', e);
    }
  }, [media.id, media.type, media.title, media.poster, media.season, media.episode, media.episodeTitle]);

  // Global listener for player messages (e.g. VidLink)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // VidLink sends messages like: { type: "vidlink_progress", data: { currentTime: 123, duration: 456 } }
      if (event.data?.type === "vidlink_progress" || event.data?.event === "timeupdate") {
        const currentTime = event.data?.data?.currentTime || event.data?.currentTime;
        const duration = event.data?.data?.duration || event.data?.duration;
        
        if (typeof currentTime === 'number') {
          saveProgress({ currentTime, duration });
        }
      }
      
      // Generic player progress (Vidsrc might use this if they update their API)
      if (event.data?.type === "MEDIA_PROGRESS") {
        saveProgress({ 
          currentTime: event.data.currentTime, 
          duration: event.data.duration 
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [saveProgress]);

  return { progress, saveProgress };
}
