import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getLatestTrendingMovies } from '@/services/movies';
import { getLatestTrendingSeries } from '@/services/series';
import { getTrendingAnime } from '@/app/lib/anilist';
import { fetchDonghuaHome } from '@/services/donghua';

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
    const today = new Date().toISOString().split('T')[0];

    const [movies, series, anime, donghua] = await Promise.all([
      getLatestTrendingMovies().catch(() => ({ results: [] })),
      getLatestTrendingSeries().catch(() => ({ results: [] })),
      getTrendingAnime(1, 5).catch(() => ({ media: [] })),
      fetchDonghuaHome().catch(() => ({ recent: [] }))
    ]);

    // 1. Process Main Channel (Movie/Series)
    if (mainChannelId) {
      const historySlug = `sync-v2-main-${today}`;
      const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
      if (!existing) {
        const topMovie = movies.results?.[0];
        const topSeries = series.results?.[0];
        let tgText = `🔥 <b>RINGKASAN CINEWATCH HARI INI</b>\n` +
                     `━━━━━━━━━━━━━━━━━━━━\n\n`;
        if (topMovie) tgText += `🎬 <b>FILM: <a href="${siteUrl}/movie/${topMovie.id}/watch">${(topMovie.title || 'Untitled').toUpperCase()}</a></b>\n` +
                                `   Rating: ⭐ ${topMovie.vote_average?.toFixed(1) || 'N/A'} | Sub Indo\n\n`;
        if (topSeries) tgText += `📺 <b>SERIES: <a href="${siteUrl}/series/${topSeries.id}/watch">${(topSeries.name || 'Untitled').toUpperCase()}</a></b>\n` +
                                 `   Rating: ⭐ ${topSeries.vote_average?.toFixed(1) || 'N/A'} | Sub Indo\n\n`;
        tgText += `━━━━━━━━━━━━━━━━━━━━\n` +
                  `🚀 <b>Tonton sekarang di CineWatch!</b>`;

        await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: mainChannelId, photo: topMovie ? `https://image.tmdb.org/t/p/w780${topMovie.backdrop_path}` : `${siteUrl}/og-image.png`, caption: tgText, parse_mode: 'HTML' })
        });
        await supabase.from('posts').insert([{ title: `Daily Sync: Main`, slug: historySlug, type: 'Bot History' }]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
