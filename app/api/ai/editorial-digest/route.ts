import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent, researchYou } from '@/services/ai';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const mainChannelId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const animeChannelId = process.env.TELEGRAM_ANIME_CHANNEL_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

  try {
    const today = new Date();
    const weekNumber = Math.ceil(today.getDate() / 7);
    const month = today.getMonth() + 1;
    const yearNum = today.getFullYear();

    const processDigest = async (types: string[], targetChannel: string | undefined, label: string) => {
      if (!targetChannel) return;

      const historySlug = `v4-editorial-blog-${label.toLowerCase()}-${yearNum}-${month}-${weekNumber}`;
      const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
      if (existing) return;

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      // 1. Gather all intel from the past week
      const { data: posts } = await supabase
        .from('posts')
        .select('title, content, type')
        .in('type', types)
        .gte('created_at', lastWeek.toISOString());

      if (posts && posts.length > 0) {
        console.log(`[BLOG REDAKSI] Merancang Blog Editorial Mingguan: ${label}...`);
        
        const rawContext = posts.map(p => `- ${p.title}: ${p.content?.slice(0, 200)}...`).join('\n');
        
        // STAGE 1: Editorial Strategy
        const strategy = await chatWithAgent('Editorial Board Director', `Review these recent updates:\n${rawContext}\n\nTask: Create a deep editorial theme for our weekly blog. What is the "Big Picture" in the movie industry this week?`, 'Strategic');

        // STAGE 2: Deep Web Research (You.com)
        const globalIntel = await researchYou(`Global analysis of ${label} trends in May 2026. Include cultural impact and industry movements.`);

        // STAGE 3: Drafting the Editorial Piece (7-Stage Hybrid)
        const finalBlogContent = await chatWithAgent('Senior Columnist', `Write a long-form, sophisticated Editorial Blog about "${label}" trends.\n\nContext:\n${rawContext}\n\nGlobal Intel: ${globalIntel}\n\nStrategy: ${strategy}\n\nTask: Write an elite Indonesian article that connects all these dots. Use a "Luxury Magazine" tone.`, 'Masterful & Elegant');

        const blogTitle = `EDITORIAL: ${label} Intelligence Report - Week ${weekNumber}`;
        const blogSlug = `editorial-${label.toLowerCase()}-${Date.now()}`;

        // 2. Publish to Website
        const { data: savedBlog } = await supabase.from('posts').insert([{
          title: blogTitle,
          slug: blogSlug,
          content: finalBlogContent,
          image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1280',
          type: 'Editorial Blog'
        }]).select().single();

        // 3. Notify Telegram
        const url = `${siteUrl}/blog/${blogSlug}`;
        const tgMessage = `📚 <b>CINEWATCH EDITORIAL BLOG</b>\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n\n` +
                        `🔥 <b>${blogTitle.toUpperCase()}</b>\n\n` +
                        `📝 <i>Sebuah mahakarya editorial terbaru dari tim redaksi pusat CineWatch telah terbit. Membedah tren sinema ${label} secara mendalam.</i>\n\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n` +
                        `📖 <a href="${url}">BACA BLOG LENGKAP</a>`;

        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: targetChannel, text: tgMessage, parse_mode: 'HTML' })
        });

        // Record history
        await supabase.from('posts').insert([{ title: `Blog History: ${label}`, slug: historySlug, type: 'Bot History' }]);
      }
    };

    await processDigest(['Movie Intel', 'Series Intel'], mainChannelId, 'Movie');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
