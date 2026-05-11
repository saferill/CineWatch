import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/services/ai';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function fetchTMDB(endpoint: string) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`);
  return res.json();
}

async function sendNotifications(title: string, teaser: string, image: string, type: string, id: string) {
  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const discordUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL || process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;
  const siteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app'}/${type.toLowerCase() === 'movie' ? 'movie' : 'series'}/${id}`;

  // 1. Telegram
  if (tgToken && tgChatId) {
    const message = `🚀 *RILIS BARU HARI INI!* (${type})\n\n🎬 *${title}*\n\n${teaser}\n\n🔗 [Tonton Sekarang](${siteUrl})`;
    try {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: message, parse_mode: 'Markdown' })
      });
    } catch (e) {
      console.error('Telegram notification failed:', e);
    }
  }

  // 2. Discord
  if (discordUrl) {
    try {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `🚀 NEW RELEASE: ${title}`,
            description: teaser,
            url: siteUrl,
            color: 0x00FF7F,
            image: { url: image },
            footer: { text: `CineWatch ${type} Sentinel` },
            timestamp: new Date().toISOString()
          }]
        })
      });
    } catch (e) {
      console.error('Discord notification failed:', e);
    }
  }
}

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
    
    // 1. Fetch New Releases
    const [movies, tv, anime, donghua] = await Promise.all([
      fetchTMDB('/movie/now_playing?language=id-ID&page=1'),
      fetchTMDB('/tv/on_the_air?language=id-ID&page=1'),
      fetchTMDB(`/discover/tv?with_genres=16&air_date.gte=${today}&air_date.lte=${today}&language=id-ID`),
      fetchTMDB(`/discover/tv?with_origin_country=CN&air_date.gte=${today}&air_date.lte=${today}&language=id-ID`)
    ]);

    // Pick 1 from each category for high-quality alerts
    const alerts = [
      ...(movies.results?.slice(0, 1).map((i: any) => ({ ...i, category: 'Movie' })) || []),
      ...(tv.results?.slice(0, 1).map((i: any) => ({ ...i, category: 'Series' })) || []),
      ...(anime.results?.slice(0, 1).map((i: any) => ({ ...i, category: 'Anime' })) || []),
      ...(donghua.results?.slice(0, 1).map((i: any) => ({ ...i, category: 'Donghua' })) || []),
    ];

    if (alerts.length === 0) {
      return NextResponse.json({ success: true, message: 'No releases found today' });
    }

    for (const item of alerts) {
      const name = item.title || item.name;
      const overview = item.overview || 'Rilis baru yang sangat dinantikan di CineWatch.';

      // CHATDEV MULTI-AGENT WORKFLOW FOR TEASER
      // Phase 1: Hype Draft
      const hypeDraft = await chatWithAgent('Hype Agent', `Buat teaser super seru dan emosional untuk rilis baru: ${name}. Deskripsi: ${overview}`, 'Eksklusif, Seru, Penuh Emosi');
      
      // Phase 2: Fact Check
      const factReview = await chatWithAgent('Analyst Agent', `Berikan 2 alasan objektif kenapa orang harus menonton ${name}. Dasar: ${overview}`, 'Lugas dan Faktual');
      
      // Phase 3: Final Social Post
      const finalTeaser = await chatWithAgent('Social Media Manager', `Gabungkan teaser ini: "${hypeDraft}" dengan ulasan ini: "${factReview}". Buat satu paragraf pendek (max 300 karakter) yang sangat menarik untuk Telegram/Discord.`, 'Viral dan Catchy');

      // 3. Send Notifications
      const img = `https://image.tmdb.org/t/p/w1280${item.backdrop_path || item.poster_path}`;
      await sendNotifications(name, finalTeaser, img, item.category, item.id);
    }

    return NextResponse.json({ success: true, alerted: alerts.length });

  } catch (error: any) {
    console.error('Release Alert Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

