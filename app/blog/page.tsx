import React from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { IconNews, IconSparkles, IconChevronRight, IconTrendingUp, IconCalendar } from '@tabler/icons-react';
import { CinematicImage } from '@/components/media/cinematic-image';
import { AtmosphereBG } from '@/components/media/atmosphere-bg';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen relative pb-20">
      {/* Atmosphere background for consistency */}
      <AtmosphereBG />

      <div className="container max-w-(--breakpoint-2xl) mx-auto px-4 md:px-8 pt-32 relative z-10">
        {/* Standard Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
              <IconSparkles className="w-3 h-3" />
              <span>CineWatch Insider</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
              Berita & <span className="text-accent">Update</span>
            </h1>
            <p className="text-zinc-500 text-sm max-w-xl font-medium">
              Temukan ulasan mendalam, berita viral, dan rekomendasi tontonan terbaik dari dunia film, anime, dan donghua.
            </p>
          </div>
        </div>

        {error || !posts || posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-3xl bg-white/[0.02] border border-white/5 border-dashed">
            <IconNews className="w-12 h-12 text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-medium text-lg uppercase tracking-widest">Belum ada konten saat ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-accent/40 hover:bg-white/[0.06] transition-all duration-300"
              >
                {/* Image Wrapper - Matches Movie Cards */}
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <CinematicImage 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                  <div className="absolute top-2 left-2">
                    <span className="text-[8px] font-black uppercase tracking-widest bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                      {post.type || 'Editorial'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                    <span>{new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-zinc-500 text-[11px] line-clamp-3 mb-6 leading-relaxed">
                    {post.content.replace(/[#*]/g, '').substring(0, 120)}...
                  </p>
                  
                  <div className="mt-auto flex items-center text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                    BACA SELENGKAPNYA
                    <IconChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform text-accent" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
