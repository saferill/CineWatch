import React from 'react';
import { fetchDonghuaHome } from '@/services/donghua';
import type { DonghuaHomeResponse, DonghuaItem } from '@/types/donghua';

export const dynamic = 'force-dynamic';

async function DonghuaCard({ item }: { item: DonghuaItem }) {
  return (
    <div className="flex flex-col gap-2 p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors">
      <img src={item.poster} alt={item.title} className="w-full h-48 object-cover rounded" />
      <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
      <p className="text-xs text-gray-400">{item.episodes} • {item.releasedOn}</p>
    </div>
  );
}

export default async function Page() {
  const data: DonghuaHomeResponse = await fetchDonghuaHome();
  const { recent, completed } = data;

  return (
    <section className="container mx-auto py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Donghua – Nonton Donghua Gratis</h1>

      <h2 className="text-xl font-semibold text-gray-200 mb-4">Rilis Terbaru</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {recent.map((item) => (
          <DonghuaCard key={item.href} item={item} />
        ))}
      </div>

      <h2 className="text-xl font-semibold text-gray-200 mb-4">Selesai</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {completed.map((item) => (
          <DonghuaCard key={item.href} item={item} />
        ))}
      </div>
    </section>
  );
}
