"use client";

import React, { useState, useEffect } from 'react';
import { useWatchTracker } from '@/hooks/use-watch-tracker';
import { IconPlayerPlay } from '@tabler/icons-react';

interface Server {
  name: string;
  url: string;
}

interface DonghuaServerPlayerProps {
  initialUrl: string;
  servers: Server[];
  mediaInfo: {
    id: string;
    title: string;
    poster: string;
    episodeTitle: string;
    slug: string;
  };
}

export function DonghuaServerPlayer({ initialUrl, servers, mediaInfo }: DonghuaServerPlayerProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isResumed, setIsResumed] = useState(false);

  const { progress, saveProgress } = useWatchTracker({
    id: mediaInfo.slug, // Use slug as ID for donghua since they use slugs
    type: "donghua",
    title: mediaInfo.title,
    poster: mediaInfo.poster,
    episodeTitle: mediaInfo.episodeTitle,
  });

  // Initialize server from history
  useEffect(() => {
    if (progress?.server) {
      const foundServer = servers.find(s => s.name === progress.server);
      if (foundServer) setCurrentUrl(foundServer.url);
    }
  }, [progress?.server, servers]);

  // Save current server
  useEffect(() => {
    const serverName = servers.find(s => s.url === currentUrl)?.name || "Default";
    saveProgress({ server: serverName });
  }, [currentUrl, servers, saveProgress]);

  return (
    <div className="space-y-6">
      {/* Video Player Section */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
        <iframe 
          src={currentUrl} 
          className="w-full h-full" 
          allowFullScreen 
          scrolling="no"
          key={currentUrl}
        />
        
        {progress?.currentTime && progress.currentTime > 30 && !isResumed && (
          <div className="absolute bottom-10 left-6 z-[10000] animate-fade-in-up">
            <div className="glass rounded-2xl p-4 flex items-center gap-4 shadow-2xl border border-white/10 backdrop-blur-2xl">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <IconPlayerPlay className="w-5 h-5" fill="currentColor" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Resume Watching</p>
                  <p className="text-xs font-bold text-white">Lanjut nonton dari {Math.floor(progress.currentTime / 60)}:{String(Math.floor(progress.currentTime % 60)).padStart(2, '0')}?</p>
                </div>
                <div className="flex gap-2 ml-2">
                  <button 
                    onClick={() => setIsResumed(true)}
                    className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest hover:bg-accent-hover transition-colors"
                  >
                    RESUME
                  </button>
                  <button 
                    onClick={() => setIsResumed(true)}
                    className="px-3 py-1.5 rounded-lg glass text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                  >
                    SKIP
                  </button>
                </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
        <h3 className="font-bold text-lg">Pilih Server</h3>
        <div className="flex flex-wrap gap-2">
          {servers.map((server) => (
            <button 
              key={server.name}
              onClick={() => setCurrentUrl(server.url)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors border ${
                currentUrl === server.url 
                  ? "bg-primary text-primary-foreground border-primary font-bold" 
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
              }`}
            >
              {server.name}
            </button>
          ))}
          
          <button
            onClick={async () => {
              alert('Mencoba lapor Donghua...');
              
              // Kirim ke Telegram (Cara Browser)
              const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
              const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
              if (tgToken && tgChatId) {
                const tgText = `🐉 DONGHUA MATI\n🎬 Judul: Donghua Episode\n📂 Server: Default\n🔗 Halaman: ${window.location.href}`;
                fetch(`https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${tgChatId}&text=${encodeURIComponent(tgText)}`).catch(() => {});
              }

              try {
                await fetch('/api/ai/repair-link', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    movieTitle: 'Donghua Episode',
                    movieId: 'donghua',
                    type: 'donghua',
                    source: 'Default Server',
                    url: currentUrl
                  }),
                });
                alert('Laporan Donghua Terkirim ke Telegram!');
              } catch (e) {
                alert('Gagal lapor!');
              }
            }}
            className="px-4 py-2 rounded-lg text-sm bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all font-bold"
          >
            LAPOR MATI
          </button>
        </div>
        <p className="text-xs text-zinc-500 italic">
          * Gunakan server lain jika video tidak bisa diputar.
        </p>
      </div>
    </div>
  );
}
