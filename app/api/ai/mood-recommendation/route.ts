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

  try {
    const today = new Date().getUTCDay();
    const config = MOODS.find(m => m.day === today) || MOODS[0];

    const data = await fetchTMDB(`/discover/movie?with_genres=${config.genre}&sort_by=popularity.desc&language=id-ID`);
    const movie = data.results?.[Math.floor(Math.random() * 5)] || data.results?.[0];

    if (!movie) throw new Error('No movie found');

    const historySlug = `mood-history-${movie.id}-${today}`;

    // ANTI-DUPLICATE
    const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
    if (existing) {
      return NextResponse.json({ success: true, message: 'Mood already sent today' });
    }

    const title = movie.title || movie.name;
    const year = (movie.release_date || movie.first_air_date || '').split('-')[0];
    const rating = movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)}/10` : '⭐ N/A';

    // 2. AI Curation
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';
    const movieUrl = `${siteUrl}/movie/${movie.id}/watch`;
    
    let curation = "";
    try {
      curation = await chatWithAgent(
        'Mood Curator', 
        `Hari ini adalah ${config.mood}. Berikan sapaan mewah dan jelaskan kenapa film "${title}" (${year}) cocok ditonton hari ini.`,
        'Inspiratif dan Cinematic'
      );
      if (curation.includes("gangguan") || curation.includes("Maaf")) throw new Error("AI Error");
    } catch (e) {
      curation = `Pilihan terbaik untuk menemani ${config.mood} Anda hari ini adalah "${title}". Saksikan sekarang di CineWatch.`;
    }

    // 3. Dispatch
    const discordUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChannelId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    const tgMessage = `✨ <b>CINEWATCH DAILY MOOD</b> ✨\n` +
                      `━━━━━━━━━━━━━━━━━━\n\n` +
                      `🌟 <b>${config.mood.toUpperCase()}</b>\n\n` +
                      `🔥 <b>${title.toUpperCase()}</b> (${year})\n` +
                      `🌟 <b>Rating:</b> ${rating}\n\n` +
                      `📝 <i>"${curation}"</i>\n\n` +
                      `━━━━━━━━━━━━━━━━━━\n` +
                      `🚀 <a href="${movieUrl}">NONTON SESUAI MOOD</a>`;

    if (tgToken && tgChannelId) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: tgChannelId, 
          photo: `https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}`,
          caption: tgMessage, 
          parse_mode: 'HTML' 
        })
      });
    }

    if (discordUrl) {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `✨ DAILY MOOD: ${config.mood}`,
            description: `**${title}** (${year})\n\n` + curation + `\n\n🎬 **[NONTON SEKARANG](${movieUrl})**`,
            color: 0x8B5CF6,
            image: { url: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` },
            footer: { text: "CineWatch Mood Concierge" },
            timestamp: new Date().toISOString()
          }]
        })
      });
    }

    // SAVE TO HISTORY
    await supabase.from('posts').insert([{
      title: `Mood History: ${config.mood}`,
      slug: historySlug,
      content: `Mood sent at ${new Date().toISOString()}`,
      type: 'Bot History'
    }]);

    return NextResponse.json({ success: true, movie: title, mood: config.mood });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
