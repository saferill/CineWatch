import React from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft, IconCalendar, IconUser, IconSparkles, IconShare } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Immersive Hero Header */}
      <div className="relative w-full h-[50vh] md:h-[70vh] min-h-[400px] overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover scale-105 animate-subtle-zoom" 
        />
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20">
          <div className="container max-w-(--breakpoint-xl) mx-auto">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors text-xs font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
            >
              <IconArrowLeft className="w-4 h-4" />
              Kembali ke Blog
            </Link>
            
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <IconSparkles className="w-3 h-3" />
              <span>{post.type}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[0.95] tracking-tighter uppercase max-w-4xl">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/50 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <IconCalendar className="w-4 h-4 text-accent" />
                {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <IconUser className="w-4 h-4 text-accent" />
                CineWatch AI Assistant
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          <article className="flex-1 prose prose-invert prose-zinc max-w-none 
            prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-headings:text-white
            prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-lg
            prose-strong:text-white prose-strong:font-bold
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-accent prose-blockquote:bg-accent/5 prose-blockquote:p-6 prose-blockquote:rounded-2xl prose-blockquote:italic
            prose-img:rounded-3xl prose-img:border prose-img:border-white/10 shadow-2xl
          ">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </article>
          
          {/* Sidebar / Actions */}
          <aside className="lg:w-64 space-y-8">
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 sticky top-24">
              <h4 className="text-xs font-black uppercase tracking-widest text-white mb-4">Tonton Sekarang</h4>
              <p className="text-zinc-500 text-xs mb-6">Nikmati film ini dengan kualitas terbaik di CineWatch.</p>
              <Link 
                href="/" 
                className="block w-full py-3 px-4 bg-white text-black text-center text-xs font-black uppercase tracking-widest rounded-xl hover:bg-accent hover:text-white transition-all shadow-lg"
              >
                Cari di Home
              </Link>
              
              <button className="w-full mt-4 py-3 px-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                <IconShare className="w-4 h-4" /> Bagikan
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Related / Footer Call to Action */}
      <footer className="bg-white/[0.02] border-t border-white/5 py-20 mt-20">
        <div className="container mx-auto px-6 text-center">
          <IconSparkles className="w-12 h-12 text-accent mx-auto mb-6 opacity-50" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 uppercase tracking-tighter">
            Terus Update dengan <span className="text-accent">CineWatch</span>
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto mb-10 text-sm font-medium">
            Jangan lewatkan berita-berita seru lainnya seputar dunia perfilman yang dihadirkan setiap hari oleh sistem AI kami.
          </p>
          <Link 
            href="/blog" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground font-black rounded-full hover:scale-105 transition-transform shadow-2xl shadow-accent/20"
          >
            LIHAT BERITA LAINNYA
          </Link>
        </div>
      </footer>
    </div>
  );
}
