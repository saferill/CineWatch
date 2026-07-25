export interface WatchProgress {
  id: number | string;
  type: "movie" | "tv" | "anime" | "donghua";
  title: string;
  poster: string;
  season?: number;
  episode?: number;
  episodeTitle?: string;
  currentTime: number;
  duration: number;
  server?: string;
  subtitle?: string;
  updatedAt: number;
}
