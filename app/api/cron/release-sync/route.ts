import { NextResponse } from 'next/server';
import { getLatestTrendingMovies } from '@/services/movies';
import { getLatestTrendingSeries } from '@/services/series';
import { getTrendingAnime } from '@/app/lib/anilist';
import { fetchDonghuaHome } from '@/services/donghua';

// This function can be called by a CRON job (e.g., Vercel Cron or GitHub Actions)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const webhookUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
  }

  try {
    console.log('CRON: Starting release-sync...');
    
    // Fetch everything
    const [movies, series, anime, donghua] = await Promise.all([
      getLatestTrendingMovies().catch(e => { console.error('Movie fetch error:', e); return { results: [] }; }),
      getLatestTrendingSeries().catch(e => { console.error('Series fetch error:', e); return { results: [] }; }),
      getTrendingAnime(1, 5).catch(e => { console.error('Anime fetch error:', e); return { media: [] }; }),
      fetchDonghuaHome().catch(e => { console.error('Donghua fetch error:', e); return { recent: [] }; })
    ]);

    const topMovie = movies.results?.[0];
    const topSeries = series.results?.[0];
    const topAnime = anime.media?.[0];
    const topDonghua = donghua.recent?.[0];

    console.log('CRON: Fetched data:', {
      movie: topMovie?.title,
      series: topSeries?.name,
      anime: topAnime?.title?.english || topAnime?.title?.romaji,
      donghua: topDonghua?.title
    });

    const embeds = [];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app';

    // Movie Embed
    if (topMovie) {
      embeds.push({
        title: `🎬 FILM POPULER: ${topMovie.title || 'Unknown Title'}`,
        description: (topMovie.overview || 'No description available').slice(0, 150) + '...',
        url: `${siteUrl}/movie/${topMovie.id}`,
        color: 0x06b6d4,
        image: topMovie.backdrop_path ? { url: `https://image.tmdb.org/t/p/w500${topMovie.backdrop_path}` } : undefined,
        fields: [
          { name: "⭐ Rating", value: `${(topMovie.vote_average || 0).toFixed(1)}/10`, inline: true },
          { name: "📅 Rilis", value: topMovie.release_date || 'TBA', inline: true }
        ],
        timestamp: new Date().toISOString()
      });
    }

    // Series Embed
    if (topSeries) {
      embeds.push({
        title: `📺 SERIES POPULER: ${topSeries.name || 'Unknown Title'}`,
        description: (topSeries.overview || 'No description available').slice(0, 150) + '...',
        url: `${siteUrl}/series/${topSeries.id}`,
        color: 0x8b5cf6,
        image: topSeries.backdrop_path ? { url: `https://image.tmdb.org/t/p/w500${topSeries.backdrop_path}` } : undefined,
        fields: [
          { name: "⭐ Rating", value: `${(topSeries.vote_average || 0).toFixed(1)}/10`, inline: true },
          { name: "📅 Rilis", value: topSeries.first_air_date || 'TBA', inline: true }
        ]
      });
    }

    // Anime Embed
    if (topAnime) {
      const animeTitle = topAnime.title.english || topAnime.title.romaji || 'Unknown Anime';
      embeds.push({
        title: `🍥 ANIME TRENDING: ${animeTitle}`,
        description: (topAnime.description || 'No description available').replace(/<[^>]*>?/gm, '').slice(0, 150) + '...',
        url: `${siteUrl}/anime/${topAnime.id}`,
        color: 0xffa500,
        image: (topAnime.bannerImage || topAnime.coverImage?.large) ? { url: topAnime.bannerImage || topAnime.coverImage.large } : undefined,
        fields: [
          { name: "⭐ Score", value: `${topAnime.averageScore || 0}%`, inline: true },
          { name: "📅 Season", value: `${topAnime.season || ''} ${topAnime.seasonYear || ''}`.trim() || 'TBA', inline: true }
        ]
      });
    }

    // Donghua Embed
    if (topDonghua) {
      const donghuaUrl = topDonghua.href ? `${siteUrl}${topDonghua.href}` : `${siteUrl}/donghua`;

      embeds.push({
        title: `🐉 DONGHUA TERBARU: ${topDonghua.title || 'Unknown Title'}`,
        description: `Update episode terbaru dari ${topDonghua.title || 'donghua ini'} kini sudah tersedia!`,
        url: donghuaUrl,
        color: 0xff0000,
        image: topDonghua.poster ? { url: topDonghua.poster } : undefined,
        fields: [
          { name: "🔖 Status", value: "Baru Rilis", inline: true }
        ]
      });
    }

    if (embeds.length === 0) {
      console.log('CRON: No items to sync.');
      return NextResponse.json({ message: 'No items to sync' });
    }

    // Send to Discord
    console.log('CRON: Sending to Discord Webhook...');
    const discordRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "🔥 **RINGKASAN CINEWATCH HARI INI**",
        embeds: embeds
      })
    });
    
    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      console.error(`CRON: Discord Webhook failed with status ${discordRes.status}:`, errorText);
    } else {
      console.log('CRON: Successfully sent to Discord.');
    }

    // Send to Telegram
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (tgToken && tgChatId) {
      console.log('CRON: Sending to Telegram...');
      let tgText = "<b>🔥 RINGKASAN CINEWATCH HARI INI</b>\n\n";
      
      if (topMovie) tgText += `🎬 <b>FILM:</b> <a href="${siteUrl}/movie/${topMovie.id}">${topMovie.title}</a>\n`;
      if (topSeries) tgText += `📺 <b>SERIES:</b> <a href="${siteUrl}/series/${topSeries.id}">${topSeries.name}</a>\n`;
      if (topAnime) tgText += `🍥 <b>ANIME:</b> <a href="${siteUrl}/anime/${topAnime.id}">${topAnime.title.english || topAnime.title.romaji}</a>\n`;
      if (topDonghua) tgText += `🐉 <b>DONGHUA:</b> <a href="${siteUrl}/donghua">${topDonghua.title}</a>\n`;
      
      tgText += "\n🚀 <b>Tonton sekarang di CineWatch!</b>";

      const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChatId,
          text: tgText,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      });

      if (!tgRes.ok) {
        const errorText = await tgRes.text();
        console.error(`CRON: Telegram API failed with status ${tgRes.status}:`, errorText);
      } else {
        console.log('CRON: Successfully sent to Telegram.');
      }
    }

    return NextResponse.json({ 
      success: true, 
      synced: embeds.length,
      message: 'Check your Discord and Telegram channels!' 
    });
  } catch (error: any) {
    console.error('CRON: System Error:', error);
    return NextResponse.json({ 
      error: 'Internal System Error', 
      details: error.message 
    }, { status: 500 });
  }
}
