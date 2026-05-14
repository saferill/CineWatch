import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/services/ai';
import { supabase } from '@/lib/supabase';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function fetchTMDB(endpoint: string) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`);
  return res.json();
}

const MOODS = [
  { day: 1, mood: "Motivation Monday", genre: 99 }, // Documentary
  { day: 2, mood: "Thrilling Tuesday", genre: 53 }, // Thriller
  { day: 3, mood: "Wacky Wednesday", genre: 35 },   // Comedy
  { day: 4, mood: "Thoughtful Thursday", genre: 18 }, // Drama
  { day: 5, mood: "Spooky Friday", genre: 27 },     // Horror
  { day: 6, mood: "Action Saturday", genre: 28 },   // Action
  { day: 0, mood: "Romantic Sunday", genre: 10749 }, // Romance
];

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
    const today = new Date().getUTCDay();
    const config = MOODS.find(m => m.day === today) || MOODS[0];

    const processMood = async (type: string, targetChannel: string | undefined, label: string) => {
      if (!targetChannel) return;
      
      const page = Math.floor(Math.random() * 5) + 1;
      let endpoint = type === 'main' 
        ? `/discover/movie?with_genres=${config.genre}&sort_by=popularity.desc&language=id-ID&page=${page}`
        : `/discover/tv?with_genres=16&sort_by=popularity.desc&language=id-ID&page=${page}`;

      const data = await fetchTMDB(endpoint);
      const item = data.results?.[Math.floor(Math.random() * 5)] || data.results?.[0];
      if (!item) return;

      const historySlug = `v3-mood-${item.id}-${type}-${today}`;
      const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
      if (existing) return;

      const title = item.title || item.name;
      
      // Record FIRST to prevent duplicates
      await supabase.from('posts').insert([{ title: `History Mood: ${title}`, slug: historySlug, type: 'Bot History' }]);

      const year = (item.release_date || item.first_air_date || '').split('-')[0];
      const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}/10` : '⭐ N/A';

      let curation = "";
      try {
        curation = await chatWithAgent(
          'Empathy & Atmosphere Specialist', 
          `Hari ini ${config.mood}. Hubungkan suasana hari ini dengan tema film/anime "${title}". Mengapa ini pilihan yang sempurna untuk memuaskan batin user saat ini?`, 
          'Inspirational & Deep'
        );
        if (curation.includes("gangguan") || curation.includes("Maaf")) throw new Error("AI Error");
      } catch (e) {
        curation = `Pilihan terbaik untuk melengkapi ${config.mood} Anda hari ini. Selamat menikmati mahakarya sinematik ini.`;
      }

      const watchUrl = `${siteUrl}/${item.title ? 'movie' : 'series'}/${item.id}/watch`;
      const tgMessage = `✨ <b>CINEWATCH DAILY MOOD</b> ✨\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n\n` +
                        `🌟 <b>${config.mood.toUpperCase()}</b>\n\n` +
                        `🔥 <b>${title.toUpperCase()}</b> (${year})\n` +
                        `🌟 <b>Rating:</b> ${rating}\n\n` +
                        `📝 <i>"${curation}"</i>\n\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n` +
                        `🚀 <a href="${watchUrl}">NONTON SESUAI MOOD</a>`;

      await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: targetChannel, 
          photo: `https://image.tmdb.org/t/p/w780${item.backdrop_path || item.poster_path}`,
          caption: tgMessage, 
          parse_mode: 'HTML' 
        })
      });
    };

    await processMood('main', mainChannelId, 'Movie Mood');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
