import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/services/ai';
import { searchMovies } from '@/app/lib/tmdb';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const typeParam = searchParams.get('type'); // 'main' or 'anime'
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const mainChannelId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const animeChannelId = process.env.TELEGRAM_ANIME_CHANNEL_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

  if (!tgToken) return NextResponse.json({ error: 'Bot token missing' }, { status: 500 });

  const summary = { main: 0, anime: 0 };

  const processCategory = async (type: string, targetChannel: string | undefined) => {
    if (!targetChannel) return;
    
    // Choose count: 1 for frequent anime updates, 2 for slower main updates
    const count = typeParam === 'anime' ? 1 : 2;
    const page = Math.floor(Math.random() * 10) + 1;
    let endpoint = "";
    if (type === 'movie') {
      endpoint = `/discover/movie?sort_by=popularity.desc&vote_average.gte=6&language=id-ID&page=${page}`;
    } else if (type === 'series') {
      endpoint = `/discover/tv?sort_by=popularity.desc&vote_average.gte=6&language=id-ID&page=${page}`;
    } else if (type === 'anime') {
      endpoint = `/discover/tv?with_genres=16&sort_by=popularity.desc&language=id-ID&page=${page}`;
    } else if (type === 'donghua') {
      endpoint = `/discover/tv?with_origin_country=CN&sort_by=popularity.desc&language=id-ID&page=${page}`;
    }

    const res = await fetch(`https://api.themoviedb.org/3${endpoint}&api_key=${process.env.TMDB_API_KEY}`);
    const data = await res.json();
    const items = data.results?.slice(0, count) || []; 

    for (const item of items) {
      const historySlug = `filler-v2-${item.id}-${type}-${targetChannel}`;
      const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
      if (existing) continue;

      const title = item.title || item.name;
      const year = (item.release_date || item.first_air_date || '').split('-')[0];
      const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}/10` : '⭐ N/A';
      const genreMap: any = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 27: 'Horror', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller' };
      const genres = item.genre_ids?.slice(0, 2).map((id: number) => genreMap[id] || 'General').join(', ') || 'Sinema';

      let hype = "";
      try {
        hype = await chatWithAgent('Luxury Critic', `Promosikan ${type} "${title}" (${year}). Berikan 1 kalimat mewah.`, 'Sophisticated');
        if (hype.includes("gangguan") || hype.includes("Maaf")) throw new Error("AI Error");
      } catch (e) {
        hype = item.overview ? item.overview.slice(0, 150) + "..." : "Mahakarya sinematik eksklusif di CineWatch.";
      }

      const watchUrl = `${siteUrl}/${item.title ? 'movie' : 'series'}/${item.id}/watch`;
      const message = `✨ <b>CINEWATCH ${type === 'anime' || type === 'donghua' ? 'ANIME' : 'PREMIER'}</b> ✨\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n\n` +
                      `🔥 <b>${title.toUpperCase()}</b> (${year})\n\n` +
                      `🏆 <b>Status:</b> <code>VERIFIED QUALITY</code> ✅\n` +
                      `🌟 <b>Rating:</b> ${rating}\n` +
                      `🎭 <b>Genre:</b> ${genres}\n` +
                      `🇮🇩 <b>Subtitle:</b> Indonesia (Aktif)\n` +
                      `🎥 <b>Kualitas:</b> 1080p Full HD\n\n` +
                      `📝 <b>SINOPSIS:</b>\n` +
                      `<i>"${hype}"</i>\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🎬 <b>CineWatch Intel Protocol v2.0</b>\n` +
                      `🚀 <a href="${watchUrl}">KLIK UNTUK MULAI NONTON</a>`;

      await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChannel,
          photo: `https://image.tmdb.org/t/p/w780${item.poster_path}`,
          caption: message,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "🍿 NONTON SEKARANG (SUB INDO)", url: watchUrl }],
              [{ text: "🌐 Website Utama", url: siteUrl }]
            ]
          }
        })
      });

      await supabase.from('posts').insert([{ title: `History: ${title}`, slug: historySlug, type: 'Bot History' }]);
      if (targetChannel === mainChannelId) summary.main++; else summary.anime++;
      await new Promise(r => setTimeout(r, 2000));
    }
  };

  try {
    console.log(`🤖 AI: Executing Main Channel Filler [Mode: ${typeParam || 'Main'}]...`);
    
    // Only process for Main Channel (Movie/Series)
    await processCategory('movie', mainChannelId);
    await processCategory('series', mainChannelId);

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
