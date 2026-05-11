import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

    // 1. Fetch top 3 articles from last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const { data: posts, error } = await supabase
      .from('posts')
      .select('title, slug, image_url, created_at')
      .gte('created_at', lastWeek.toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;
    if (!posts || posts.length === 0) {
      return NextResponse.json({ success: true, message: 'No new articles this week' });
    }

    // 2. Prepare Messages
    const discordUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    let tgMessage = `📚 <b>CINEWATCH EDITORIAL DIGEST</b> 📚\n\n`;
    tgMessage += `<i>Minggu yang produktif! Berikut adalah ulasan pilihan tim redaksi CineWatch minggu ini:</i>\n\n`;

    const embeds = posts.map(post => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      tgMessage += `🔹 <b><a href="${postUrl}">${post.title}</a></b>\n\n`;
      
      return {
        title: post.title,
        url: postUrl,
        image: { url: post.image_url },
        color: 0x10B981, // Emerald
      };
    });

    tgMessage += `📖 <i>Baca selengkapnya di blog kami!</i>`;

    // 3. Dispatch
    if (tgToken && tgChatId) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: tgMessage, parse_mode: 'HTML' })
      });
    }

    if (discordUrl) {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: "📚 **CINEWATCH EDITORIAL DIGEST**\nRecap ulasan pilihan minggu ini:",
          embeds: embeds
        })
      });
    }

    return NextResponse.json({ success: true, count: posts.length });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
