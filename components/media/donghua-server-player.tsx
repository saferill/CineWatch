"use client";

import React, { useState } from 'react';

interface Server {
  name: string;
  url: string;
}

interface DonghuaServerPlayerProps {
  initialUrl: string;
  servers: Server[];
}

export function DonghuaServerPlayer({ initialUrl, servers }: DonghuaServerPlayerProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);

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
