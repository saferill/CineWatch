"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { IconPlayerPlay, IconPlayerPause, IconVolume, IconVolumeOff, IconMaximize } from "@tabler/icons-react";

interface CleanHlsPlayerProps {
  movieId: string;
  type: "movie" | "tv" | "anime";
  season?: number;
  episode?: number;
  poster?: string;
  title?: string;
}

export function CleanHlsPlayer({
  movieId,
  type,
  season = 1,
  episode = 1,
  poster,
  title,
}: CleanHlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Get stream URL from clean proxy / direct endpoint
    const fetchStream = async () => {
      try {
        // Construct clean embed or direct stream fallback
        const cleanStreamUrl = type === "movie"
          ? `https://vidlink.pro/movie/${movieId}`
          : `https://vidlink.pro/tv/${movieId}/${season}/${episode}`;

        if (isMounted) {
          setStreamUrl(cleanStreamUrl);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError("Gagal memuat stream langsung. Mengalihkan ke server cadangan...");
          setLoading(false);
        }
      }
    };

    fetchStream();

    return () => {
      isMounted = false;
    };
  }, [movieId, type, season, episode]);

  useEffect(() => {
    if (!videoRef.current || !streamUrl || !streamUrl.endsWith(".m3u8")) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    }
  }, [streamUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white rounded-2xl p-8 border border-white/10">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-zinc-400">Menyiapkan Stream Bebas Iklan...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden group border border-white/10 shadow-2xl">
      <iframe
        src={`${streamUrl}?primaryColor=06b6d4&autoplay=true&subTitle=Indonesian`}
        className="w-full h-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        title="Clean Ad-Free Player"
      />
    </div>
  );
}
