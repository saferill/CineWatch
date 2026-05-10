import React from 'react';
import { fetchDonghuaEpisode } from '@/services/donghua';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { DonghuaServerPlayer } from '@/components/media/donghua-server-player';


export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const data = await fetchDonghuaEpisode(slug);
    return (
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="container mx-auto px-4 py-8 space-y-6">
          
          {/* Breadcrumbs / Title */}
          <div className="flex flex-col gap-2">
            <Link href={`/donghua/detail/${data.donghua.slug}`} className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
              <ChevronLeft className="size-4" />
              Kembali ke Detail
            </Link>
            <h1 className="text-2xl md:text-3xl font-black">{data.title}</h1>
            <p className="text-zinc-500">{data.donghua.title}</p>
          </div>

          {/* Video Player & Servers Section */}
          <DonghuaServerPlayer 
            initialUrl={data.streamingUrl} 
            servers={data.servers} 
            mediaInfo={{
              id: data.donghua.slug,
              title: data.donghua.title,
              poster: data.donghua.poster,
              episodeTitle: data.title,
              slug: data.donghua.slug
            }}
          />

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                {data.navigation.prev && (
                  <Link 
                    href={`/donghua/episode/${data.navigation.prev.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors"
                  >
                    <ChevronLeft className="size-5" />
                    <span>Prev</span>
                  </Link>
                )}
                <Link 
                  href={`/donghua/detail/${data.donghua.slug}`}
                  className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl border border-zinc-800 transition-colors"
                  title="Daftar Episode"
                >
                  <List className="size-5" />
                </Link>
                {data.navigation.next && (
                  <Link 
                    href={`/donghua/episode/${data.navigation.next.slug}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 rounded-xl transition-colors font-bold"
                  >
                    <span>Next</span>
                    <ChevronRight className="size-5" />
                  </Link>
                )}
              </div>
            </div>

            <div className="w-full md:w-80 shrink-0">
               <div className="rounded-2xl overflow-hidden border border-zinc-800 relative group">
                  <img src={data.donghua.poster} alt={data.donghua.title} className="w-full h-auto opacity-50 group-hover:opacity-70 transition-opacity" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <h4 className="font-bold mb-4">{data.donghua.title}</h4>
                      <Link href={`/donghua/detail/${data.donghua.slug}`} className="px-6 py-2 bg-primary rounded-full text-sm font-bold shadow-lg">
                          Lihat Info
                      </Link>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Donghua Episode Error:", error);
    throw error;
  }
}
