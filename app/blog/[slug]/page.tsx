import React from 'react';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { IconArrowLeft, IconCalendar, IconUser, IconSparkles, IconShare, IconPlayerPlay, IconShieldCheck, IconCertificate, IconEyeCheck } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import { getBlogSummary } from '@/services/ai';
import { CinematicImage } from '@/components/media/cinematic-image';
import { AtmosphereBG } from '@/components/media/atmosphere-bg';
import { BlogCTA } from '@/components/blog/blog-cta';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await supabase.from('posts').select('title, content, image').eq('slug', slug).single();

  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | CineWatch Global Media`,
    description: post.content.slice(0, 160).replace(/[#*]/g, '') + '...',
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 160).replace(/[#*]/g, ''),
      images: [post.image],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content.slice(0, 160).replace(/[#*]/g, ''),
      images: [post.image],
    },
  };
}

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

  const aiSummary = await getBlogSummary(post.content);

  return (
    <div className="min-h-screen bg-background relative pb-20">
      <AtmosphereBG />

      {/* Standard Hero Section (Matches Movie Details) */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden">
        <CinematicImage 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover scale-105 animate-subtle-zoom" 
        />
        
        {/* Standard Cinematic Gradients */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-background/40 to-transparent pointer-events-none" />

        <div className="absolute bottom-0 left-0 w-full z-20 p-6 md:p-12 lg:p-20">
          <div className="container max-w-(--breakpoint-2xl) mx-auto">
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors text-[10px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
            >
              <IconArrowLeft className="w-4 h-4" />
              Kembali ke Blog
            </Link>
            
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest mb-4">
              <IconSparkles className="w-3 h-3" />
              <span>{post.type || 'Editorial'}</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight uppercase max-w-4xl">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-white/50 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <IconCalendar className="w-4 h-4 text-accent" />
                {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <IconUser className="w-4 h-4 text-accent" />
                CineWatch Board
              </div>
            </div>

            {/* CORPORATE EDITORIAL BADGES (Milestone 1) */}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                <IconShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Verified by Legal</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                <IconCertificate className="w-4 h-4 text-blue-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">QA Audit Passed</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl">
                <IconEyeCheck className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">Strategically Curated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content Container - Standard Spacing */}
      <div className="container max-w-4xl mx-auto px-4 md:px-8 pt-12 pb-32">
        {/* Main Article */}
        <article className="prose prose-invert prose-zinc max-w-none 
          prose-headings:font-black prose-headings:tracking-tight prose-headings:uppercase prose-headings:text-white
          prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-lg
          prose-strong:text-white prose-strong:font-bold
          prose-blockquote:border-accent prose-blockquote:bg-accent/5 prose-blockquote:p-6 prose-blockquote:rounded-2xl prose-blockquote:italic
          prose-img:rounded-3xl prose-img:border prose-img:border-white/10
        ">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* Global Blog CTA - Now functional and at the bottom */}
        <BlogCTA title={post.title} slug={post.slug} />
      </div>
    </div>
  );
}
