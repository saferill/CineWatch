import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/services/ai';
import { searchMovies } from '@/app/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChannelId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

    if (!tgToken || !tgChannelId) {
      return NextResponse.json({ error: 'Telegram config missing' }, { status: 500 });
    }

    // 1. Pick a Random Trending Category
    const categories = ['movie', 'tv', 'anime', 'donghua'];
    const type = categories[Math.floor(Math.random() * categories.length)];
    const today = new Date().toISOString().split('T')[0];
    
    // 2. Fetch Items (Released only, Sorted by Popularity)
    const page = Math.floor(Math.random() * 3) + 1; // Pick from top 3 pages for quality
    let endpoint = "";
    
    if (type === 'movie') {
      endpoint = `/discover/movie?primary_release_date.lte=${today}&sort_by=popularity.desc&vote_average.gte=5&with_release_type=2|3|4&language=id-ID&page=${page}`;
    } else if (type === 'tv') {
      endpoint = `/discover/tv?first_air_date.lte=${today}&sort_by=popularity.desc&vote_average.gte=5&language=id-ID&page=${page}`;
    } else if (type === 'anime') {
      endpoint = `/discover/tv?with_genres=16&first_air_date.lte=${today}&sort_by=popularity.desc&vote_average.gte=5&language=id-ID&page=${page}`;
    } else if (type === 'donghua') {
      endpoint = `/discover/tv?with_origin_country=CN&first_air_date.lte=${today}&sort_by=popularity.desc&vote_average.gte=5&language=id-ID&page=${page}`;
    }

    const res = await fetch(`https://api.themoviedb.org/3${endpoint}&api_key=${process.env.TMDB_API_KEY}`);
    const data = await res.json();
    let items = data.results || [];
    
    // Safety check: Filter out anything with a future release date just in case
    items = items.filter((i: any) => {
      const rDate = i.release_date || i.first_air_date;
      return rDate && rDate <= today;
    });

    if (items.length === 0) throw new Error('No playable items found');
    
    const item = items[Math.floor(Math.random() * Math.min(items.length, 10))]; // Pick from top 10 for better quality
    const title = item.title || item.name;

    // 3. AI Hype Generation (Unique Every Time)
    const hype = await chatWithAgent(
      'Channel Growth Manager',
      `Buat pesan singkat (max 200 karakter) untuk channel Telegram yang mempromosikan film "${title}" (${type}). Katakan bahwa film ini sudah tersedia dengan SUBTITLE INDONESIA di CineWatch. Gunakan banyak emoji dan gaya bahasa yang bikin orang mau klik.`,
      'Viral, Menarik, dan High-Conversion'
    );

    const message = `🎬 <b>REKOMENDASI NEXUS</b> 🎬\n\n` +
                    `🔥 <b>${title}</b>\n\n` +
                    `${hype}\n\n` +
                    `🇮🇩 <b>Subtitle:</b> Indonesia (Aktif)\n` +
                    `🎥 <b>Kualitas:</b> 1080p Full HD\n\n` +
                    `🚀 <a href="${siteUrl}/${item.title ? 'movie' : 'series'}/${item.id}/watch">MULAI NONTON SEKARANG</a>`;

    const posterUrl = `https://image.tmdb.org/t/p/w780${item.poster_path}`;

    // 4. Send to Telegram
    await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: tgChannelId,
        photo: posterUrl,
        caption: message,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: "🍿 Tonton / Download Sub Indo", url: `${siteUrl}/${item.title ? 'movie' : 'series'}/${item.id}/watch` }]]
        }
      })
    });

    return NextResponse.json({ success: true, item: title, type });

  } catch (error: any) {
    console.error('Channel Filler Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
