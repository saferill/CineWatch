import { NextResponse } from 'next/server';
import { getLatestTrendingMovies } from '@/services/movies';
import { getLatestTrendingSeries } from '@/services/series';
import { getTrendingAnime } from '@/app/lib/anilist';
import { fetchDonghuaHome } from '@/services/donghua';

// This function can be called by a CRON job (e.g., Vercel Cron or GitHub Actions)
export async function GET(request: Request) {
  // Check for authorization (optional but recommended for Cron jobs)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const webhookUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
  }

  try {
    // Fetch everything
    const [movies, series, anime, donghua] = await Promise.all([
      getLatestTrendingMovies(),
      getLatestTrendingSeries(),
      getTrendingAnime(1, 5),
      fetchDonghuaHome()
    ]);

    const topMovie = movies.results?.[0];
    const topSeries = series.results?.[0];
    const topAnime = anime.media?.[0];
    const topDonghua = donghua.recent?.[0];

    const embeds = [];

    // Movie Embed
    if (topMovie) {
      embeds.push({
        title: `🎬 FILM POPULER: ${topMovie.title || 'Unknown Title'}`,
        description: (topMovie.overview || 'No description available').slice(0, 150) + '...',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app'}/movie/${topMovie.id}`,
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
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app'}/series/${topSeries.id}`,
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
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app'}/anime/${topAnime.id}`,
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
      embeds.push({
        title: `🐉 DONGHUA TERBARU: ${topDonghua.title || 'Unknown Title'}`,
        description: `Update episode terbaru dari ${topDonghua.title || 'donghua ini'} kini sudah tersedia!`,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app'}/donghua/detail/${topDonghua.slug}`,
        color: 0xff0000,
        image: topDonghua.image ? { url: topDonghua.image } : undefined,
        fields: [
          { name: "🔖 Status", value: "Baru Rilis", inline: true }
        ]
      });
    }

    if (embeds.length === 0) {
      return NextResponse.json({ message: 'No items to sync' });
    }

    // Send to Discord
    console.log('Sending to Discord Webhook...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: "🔥 **RINGKASAN CINEWATCH HARI INI**",
        embeds: embeds
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API Error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to send to Discord', 
        status: response.status,
        details: errorText 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      synced: embeds.length,
      message: 'Check your Discord channel!' 
    });
  } catch (error: any) {
    console.error('System Error:', error);
    return NextResponse.json({ 
      error: 'Internal System Error', 
      details: error.message 
    }, { status: 500 });
  }
}
