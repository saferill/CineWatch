import React from 'react';
import { fetchDonghuaHome } from '@/services/donghua';
import type { DonghuaHomeResponse, DonghuaItem } from '@/types/donghua';

export const dynamic = 'force-dynamic';

async function DonghuaCard({ item }: { item: DonghuaItem }) {
  return (
    <div className="flex flex-col gap-2 p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 transition-colors group cursor-pointer border border-zinc-800">
      <div className="relative aspect-[3/4] overflow-hidden rounded">
        <img 
          src={item.poster} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform group-hover:scale-110" 
        />
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded shadow-lg">
          {item.releasedOn}
        </div>
      </div>
      <h3 className="text-sm font-medium text-white truncate px-1">{item.title}</h3>
      <p className="text-[10px] text-zinc-400 px-1 uppercase tracking-wider">{item.episodes} Episodes</p>
    </div>
  );
}

export default async function Page() {
  const data: DonghuaHomeResponse = await fetchDonghuaHome();
  const { recent, completed } = data;

  return (
    <section className="container mx-auto py-8 pt-24 px-4 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">Donghua</h1>
        <p className="text-zinc-400 text-sm">Nonton donghua gratis ga pake karcis hanya di Molidonghub.</p>
      </div>

      <div className="space-y-12">
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full" />
            Rilis Terbaru
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {recent.map((item) => (
              <DonghuaCard key={item.href} item={item} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-green-500 rounded-full" />
            Telah Selesai
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {completed.map((item) => (
              <DonghuaCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
