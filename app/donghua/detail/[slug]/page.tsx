import React from 'react';
import { fetchDonghuaDetail } from '@/services/donghua';
import Link from 'next/link';
import { Star, Play, Calendar, Clock, Tv, Film } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const data = await fetchDonghuaDetail(slug);
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        {/* Hero Section with Backdrop Blur */}
        <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-30"
            style={{ backgroundImage: `url(${data.poster})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          <div className="container mx-auto px-4 h-full flex flex-col md:flex-row items-end gap-8 pb-12 relative z-10">
            <div className="w-48 md:w-64 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
              <img src={data.poster} alt={data.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {data.genres.map(genre => (
                  <span key={genre.slug} className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">
                    {genre.name}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">{data.title}</h1>
              {data.alterTitle && <p className="text-zinc-400 text-lg font-medium">{data.alterTitle}</p>}
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-300">
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <Star className="size-4 fill-current" />
                  <span className="font-bold">{data.rating || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  <span>{data.released}</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-500 font-bold uppercase">
                  <Tv className="size-4" />
                  <span>{data.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Info & Synopsis */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full" />
                Sinopsis
              </h2>
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-300 leading-relaxed">
                {data.synopsis || "Tidak ada sinopsis untuk donghua ini."}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full" />
                Daftar Episode
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {data.episodesList.map((ep, index) => (
                  <Link 
                    key={ep.slug}
                    href={`/donghua/episode/${ep.slug}`}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-primary hover:border-primary transition-all text-center group"
                  >
                    <span className="text-sm font-bold group-hover:text-white transition-colors">{ep.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Metadata */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
              <h3 className="font-bold text-lg mb-2">Informasi Detail</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Studio</span>
                  <span className="text-white font-medium">{data.studio || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Total Episode</span>
                  <span className="text-white font-medium">{data.episodesCount || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Durasi</span>
                  <span className="text-white font-medium">{data.duration || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Season</span>
                  <span className="text-white font-medium">{data.season || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tipe</span>
                  <span className="text-white font-medium">{data.type || '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Donghua Detail Error:", error);
    throw error;
  }
}
