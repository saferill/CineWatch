import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function fetchTMDB(endpoint: string) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}&api_key=${TMDB_API_KEY}`);
  return res.json();
}

export async function GET() {
  try {
    // Fetch upcoming movies
    const data = await fetchTMDB('/movie/upcoming?language=id-ID&page=1');
    const upcoming = data.results?.slice(0, 5) || [];

    if (upcoming.length === 0) return NextResponse.json({ success: true, message: 'No upcoming' });

    const discordUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;
    const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    const title = "🗓️ CINEWATCH WEEKLY HYPEx CALENDAR";
    let message = "Bersiaplah! Berikut adalah film-film besar yang akan segera hadir di CineWatch minggu ini:\n\n";
    
    upcoming.forEach((m: any, i: number) => {
      message += `${i+1}. 🎬 *${m.title}* (${m.release_date})\n`;
    });

    message += "\n🚀 Jangan lewatkan tayangan perdananya!";

    // Dispatch
    if (tgToken && tgChatId) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: `${title}\n\n${message}`, parse_mode: 'Markdown' })
      }).catch(() => {});
    }

    if (discordUrl) {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: title,
            description: message.replace(/\*/g, '**'),
            color: 0xFFFF00,
            image: { url: `https://image.tmdb.org/t/p/w1280${upcoming[0].backdrop_path}` },
            footer: { text: "CineWatch Weekly Forecast" },
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, count: upcoming.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
