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

  try {
    const today = new Date().toISOString().split('T')[0];
    const historySlug = `daily-sync-${today}`;

    // ANTI-DUPLICATE
    const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
    if (existing) {
      return NextResponse.json({ success: true, message: 'Daily summary already sent' });
    }

    const [movies, series, anime, donghua] = await Promise.all([
      getLatestTrendingMovies().catch(() => ({ results: [] })),
      getLatestTrendingSeries().catch(() => ({ results: [] })),
      getTrendingAnime(1, 5).catch(() => ({ media: [] })),
      fetchDonghuaHome().catch(() => ({ recent: [] }))
    ]);

    const topMovie = movies.results?.[0];
    const topSeries = series.results?.[0];
    const topAnime = anime.media?.[0];
    const topDonghua = donghua.recent?.[0];

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    const discordUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL;

    if (tgToken && tgChatId) {
      let tgText = `🔥 <b>RINGKASAN CINEWATCH HARI INI</b>\n` +
                   `━━━━━━━━━━━━━━━━━━\n\n`;
      
      if (topMovie) {
        const rating = topMovie.vote_average ? `⭐ ${topMovie.vote_average.toFixed(1)}` : '⭐ N/A';
        tgText += `🎬 <b>FILM: <a href="${siteUrl}/movie/${topMovie.id}/watch">${(topMovie.title || '').toUpperCase()}</a></b>\n` +
                  `   Rating: ${rating} | Sub Indo\n\n`;
      }
      if (topSeries) {
        const rating = topSeries.vote_average ? `⭐ ${topSeries.vote_average.toFixed(1)}` : '⭐ N/A';
        tgText += `📺 <b>SERIES: <a href="${siteUrl}/series/${topSeries.id}/watch">${(topSeries.name || '').toUpperCase()}</a></b>\n` +
                  `   Rating: ${rating} | Sub Indo\n\n`;
      }
      if (topAnime) {
        const aTitle = topAnime.title.english || topAnime.title.romaji || '';
        tgText += `🍥 <b>ANIME: <a href="${siteUrl}/anime/${topAnime.id}/watch">${aTitle.toUpperCase()}</a></b>\n` +
                  `   Score: ⭐ ${topAnime.averageScore}% | Sub Indo\n\n`;
      }
      if (topDonghua) {
        tgText += `🐉 <b>DONGHUA: <a href="${siteUrl}/donghua/watch">${(topDonghua.title || '').toUpperCase()}</a></b>\n` +
                  `   Status: Update Terbaru | Sub Indo\n\n`;
      }
      
      tgText += `━━━━━━━━━━━━━━━━━━\n` +
                `🚀 <b>Tonton sekarang di CineWatch!</b>`;

      const mainPoster = topMovie ? `https://image.tmdb.org/t/p/w780${topMovie.backdrop_path}` : 'https://cinewatchh.vercel.app/og-image.png';

      await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: tgChatId, 
          photo: mainPoster,
          caption: tgText, 
          parse_mode: 'HTML' 
        })
      });
    }

    if (discordUrl) {
      const embeds = [];
      if (topMovie) embeds.push({ title: `🎬 FILM: ${topMovie.title}`, url: `${siteUrl}/movie/${topMovie.id}/watch`, color: 0x06b6d4, image: { url: `https://image.tmdb.org/t/p/w500${topMovie.backdrop_path}` } });
      if (topSeries) embeds.push({ title: `📺 SERIES: ${topSeries.name}`, url: `${siteUrl}/series/${topSeries.id}/watch`, color: 0x8b5cf6, image: { url: `https://image.tmdb.org/p/w500${topSeries.backdrop_path}` } });

      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: "🔥 **RINGKASAN CINEWATCH HARI INI**", embeds })
      });
    }

    // SAVE TO HISTORY
    await supabase.from('posts').insert([{
      title: `Daily Sync: ${today}`,
      slug: historySlug,
      content: `Daily summary sent at ${new Date().toISOString()}`,
      type: 'Bot History'
    }]);

    return NextResponse.json({ success: true, message: 'Daily sync completed' });

  } catch (error: any) {
    console.error('CRON: System Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
