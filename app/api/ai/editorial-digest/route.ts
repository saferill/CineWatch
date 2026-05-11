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

      const historySlug = `digest-v2-${label.toLowerCase()}-${yearNum}-${month}-${weekNumber}`;
      const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
      if (existing) return;

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const { data: posts } = await supabase
        .from('posts')
        .select('title, slug, image, type')
        .in('type', types)
        .gte('created_at', lastWeek.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      if (posts && posts.length > 0) {
        let tgMessage = `📚 <b>CINEWATCH ${label.toUpperCase()} DIGEST</b>\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n\n` +
                        `<i>Rangkuman ulasan pilihan tim redaksi minggu ini:</i>\n\n`;

        posts.forEach(post => {
          tgMessage += `🔹 <b><a href="${siteUrl}/blog/${post.slug}">${post.title.toUpperCase()}</a></b>\n\n`;
        });

        tgMessage += `━━━━━━━━━━━━━━━━━━━━\n` +
                      `📖 <i>Baca selengkapnya di blog kami!</i>`;

        await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: targetChannel, photo: posts[0].image, caption: tgMessage, parse_mode: 'HTML' })
        });

        await supabase.from('posts').insert([{ title: `Digest History: ${label}`, slug: historySlug, type: 'Bot History' }]);
      }
    };

    await processDigest(['Movie Intel', 'Series Intel'], mainChannelId, 'Movie');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
