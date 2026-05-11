import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/services/ai';
import { supabase } from '@/lib/supabase';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function fetchTMDB(endpoint: string) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`);
  return res.json();
}

async function sendNotifications(item: any, teaser: string, type: string) {
  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const mainChannelId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const animeChannelId = process.env.TELEGRAM_ANIME_CHANNEL_ID;
  
  // Choose Target Channel
  const isAnimeDonghua = type === 'Anime' || type === 'Donghua';
  const targetChannel = isAnimeDonghua ? animeChannelId : mainChannelId;

  if (!targetChannel || !tgToken) return;

  const siteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app'}/${item.title ? 'movie' : 'series'}/${item.id}/watch`;
  const title = item.title || item.name;
  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}/10` : '⭐ N/A';
  
  const genreMap: any = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western' };
  const genres = item.genre_ids?.slice(0, 2).map((id: number) => genreMap[id] || 'Sinema').join(', ');

  const message = `🚀 <b>RILIS BARU: ${title.toUpperCase()}</b>\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n\n` +
                  `🏆 <b>Status:</b> <code>VERIFIED QUALITY</code> ✅\n` +
                  `📅 <b>Tahun:</b> ${year}\n` +
                  `🌟 <b>Rating:</b> ${rating}\n` +
                  `🎭 <b>Genre:</b> ${genres}\n` +
                  `🇮🇩 <b>Subtitle:</b> Indonesia (Aktif)\n` +
                  `🎥 <b>Kualitas:</b> Full HD 1080p\n\n` +
                  `📝 <b>SINOPSIS:</b>\n` +
                  `<i>"${teaser}"</i>\n\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `🎬 <b>CineWatch Intel Protocol v2.0</b>\n` +
                  `🔗 <a href="${siteUrl}">KLIK UNTUK MULAI NONTON</a>`;

  try {
    await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: targetChannel, 
        photo: `https://image.tmdb.org/t/p/w780${item.backdrop_path || item.poster_path}`,
        caption: message, 
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🍿 NONTON SEKARANG (SUB INDO)", url: siteUrl }],
            [{ text: "🌐 Website Utama", url: process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app' }]
          ]
        }
      })
    });
  } catch (e) {
    console.error('Telegram notification failed:', e);
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
      fetchTMDB('/discover/tv?with_genres=16&sort_by=popularity.desc&language=id-ID'),
      fetchTMDB('/discover/tv?with_origin_country=CN&sort_by=popularity.desc&language=id-ID')
    ]);

    let alerts = [
      ...(movies.results || []).map((i: any) => ({ ...i, category: 'Movie' })),
      ...(tv.results || []).map((i: any) => ({ ...i, category: 'Series' })),
      ...(anime.results || []).map((i: any) => ({ ...i, category: 'Anime' })),
      ...(donghua.results || []).map((i: any) => ({ ...i, category: 'Donghua' })),
    ];

    alerts = alerts.filter((i: any) => {
      const rDate = i.release_date || i.first_air_date;
      return rDate && rDate <= today && (i.vote_average || 0) >= 3;
    }).slice(0, 15); // Safety limit per run

    let sentCount = 0;
    for (const item of alerts) {
      const targetChannel = (item.category === 'Anime' || item.category === 'Donghua') 
        ? process.env.TELEGRAM_ANIME_CHANNEL_ID 
        : (process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID);

      if (!targetChannel) continue;
      const historySlug = `pulse-v2-${item.id}-${item.category}-${targetChannel}`;

      const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
      if (existing) continue;

      const name = item.title || item.name;
      let teaser = "";
      try {
        teaser = await chatWithAgent('Luxury Promo', `Buat teaser pendek mewah untuk rilis baru: ${name}.`, 'Elegant');
        if (teaser.includes("gangguan") || teaser.includes("Maaf")) throw new Error("AI Error");
      } catch (e) {
        teaser = (item.overview || 'Rilis baru eksklusif di CineWatch.').slice(0, 150) + "...";
      }

      await sendNotifications(item, teaser, item.category);
      await supabase.from('posts').insert([{ title: `Pulse History: ${name}`, slug: historySlug, type: 'Bot History' }]);
      sentCount++;
      await new Promise(r => setTimeout(r, 2000)); // Delay to prevent TG ban
    }

    return NextResponse.json({ success: true, alerted: sentCount });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

