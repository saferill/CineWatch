import React from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { IconNews, IconSparkles, IconChevronRight } from '@tabler/icons-react';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      {/* Cinematic Background Glow */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="container max-w-(--breakpoint-2xl) mx-auto px-4 md:px-8">
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
              Temukan ulasan mendalam, berita viral, dan rekomendasi tontonan terbaik yang dikurasi secara cerdas oleh AI kami.
            </p>
          </div>
        </div>

        {error || !posts || posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-3xl bg-white/[0.02] border border-white/5 border-dashed">
            <IconNews className="w-12 h-12 text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-medium text-lg">Belum ada konten berita saat ini.</p>
            <p className="text-zinc-600 text-sm mt-1 italic">Nantikan update terbaru dari tim AI kami segera!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/blog/${post.slug}`}
                className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-accent/30 hover:bg-white/[0.06] transition-all duration-500 shadow-xl"
              >
                {/* Image Wrapper */}
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-accent text-accent-foreground px-2 py-0.5 rounded shadow-lg">
                      {post.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                    <span>{new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>AI Review</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  
                  <div className="text-zinc-400 text-xs line-clamp-3 mb-6 leading-relaxed">
                    {post.content.replace(/[#*]/g, '').substring(0, 120)}...
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-white/50 group-hover:text-white transition-colors">
                    <span>Baca Selengkapnya</span>
                    <IconChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-accent" />
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
