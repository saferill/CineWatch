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
    const today = new Date();
    const weekNumber = Math.ceil(today.getDate() / 7);
    const month = today.getMonth() + 1;
    const yearNum = today.getFullYear();
    const historySlug = `editorial-digest-${yearNum}-${month}-${weekNumber}`;

    // ANTI-DUPLICATE CHECK
    const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
    if (existing) {
      return NextResponse.json({ success: true, message: 'Digest already sent for this week' });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

    // 1. Fetch top 3 articles from last 7 days (Excluding bot history posts)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const { data: posts, error } = await supabase
      .from('posts')
      .select('title, slug, image, created_at')
      .neq('type', 'Bot History')
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

    let tgMessage = `📚 <b>CINEWATCH EDITORIAL DIGEST</b>\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `<i>Minggu yang produktif! Berikut adalah ulasan pilihan tim redaksi CineWatch minggu ini:</i>\n\n`;

    const embeds = posts.map(post => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      tgMessage += `🔹 <b><a href="${postUrl}">${post.title.toUpperCase()}</a></b>\n\n`;
      
      return {
        title: post.title,
        url: postUrl,
        image: { url: post.image },
        color: 0x10B981,
      };
    });

    tgMessage += `━━━━━━━━━━━━━━━━━━\n` +
                  `📖 <i>Baca selengkapnya di blog kami!</i>`;

    // 3. Dispatch
    if (tgToken && tgChatId) {
      const mainImage = posts[0].image || 'https://cinewatchh.vercel.app/og-image.png';
      await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: tgChatId, 
          photo: mainImage,
          caption: tgMessage, 
          parse_mode: 'HTML' 
        })
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

    // SAVE TO HISTORY
    await supabase.from('posts').insert([{
      title: `Editorial Digest: ${month}/${yearNum}`,
      slug: historySlug,
      content: `Digest sent at ${new Date().toISOString()}`,
      type: 'Bot History'
    }]);

    return NextResponse.json({ success: true, count: posts.length });

  } catch (error: any) {
    console.error('Editorial Digest Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
