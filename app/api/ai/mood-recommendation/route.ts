import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/services/ai';

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

    // 1. Fetch movies for the genre
    const data = await fetchTMDB(`/discover/movie?with_genres=${config.genre}&sort_by=popularity.desc&language=id-ID`);
    const movie = data.results?.[Math.floor(Math.random() * 5)] || data.results?.[0];

    if (!movie) throw new Error('No movie found');

    // 2. AI Curation
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app';
    const movieUrl = `${siteUrl}/movie/${movie.id}`;
    
    const curation = await chatWithAgent(
      'Mood Curator', 
      `Hari ini adalah ${config.mood}. Berikan satu kalimat sapaan pagi yang sangat menarik dan jelaskan kenapa film "${movie.title}" cocok ditonton hari ini.`,
      'Inspiratif, Ceria, dan Cinematic'
    );

    // 3. Dispatch
    const discordUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    const tgMessage = `✨ <b>CINEWATCH DAILY MOOD</b> ✨\n\n` +
                      `🌟 <b>${config.mood}</b>\n\n` +
                      `${curation}\n\n` +
                      `🎬 <b><a href="${movieUrl}">${movie.title}</a></b>\n` +
                      `🍿 <i>Tonton sekarang di CineWatch!</i>`;

    if (tgToken && tgChatId) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: tgMessage, parse_mode: 'HTML' })
      });
    }

    if (discordUrl) {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `✨ CINEWATCH DAILY MOOD: ${config.mood}`,
            description: curation + `\n\n🎬 **[${movie.title}](${movieUrl})**`,
            color: 0x8B5CF6,
            image: { url: `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` },
            footer: { text: "CineWatch Mood Concierge" },
            timestamp: new Date().toISOString()
          }]
        })
      });
    }

    return NextResponse.json({ success: true, movie: movie.title, mood: config.mood });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
