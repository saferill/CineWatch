import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const ROUTER_ENDPOINT = 'http://localhost:20128/v1/chat/completions';
const ROUTER_API_KEY = 'sk-3b8bb76c31c5d9f6-ou98nq-8db2a0be';

async function chatDevAgent(role: string, prompt: string) {
  const res = await fetch(ROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gemini/gemini-3.1-flash-lite-preview',
      messages: [
        { role: 'system', content: `You are the CineWatch AI Request Concierge. Role: ${role}. Language: Bahasa Indonesia.` },
        { role: 'user', content: prompt }
      ]
    })
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function POST(req: Request) {
  try {
    const { movieTitle, requesterName, platform } = await req.json();

    // 1. Validate Movie with TMDB
    const searchRes = await fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(movieTitle)}&api_key=${TMDB_API_KEY}`);
    const searchData = await searchRes.json();
    const movie = searchData.results?.[0];

    if (!movie) {
      return NextResponse.json({ success: false, message: 'Film tidak ditemukan di database global.' });
    }

    const title = movie.title || movie.name;

    // 2. ChatDev Collaboration: Create Hype Response for User
    const hypeResponse = await chatDevAgent('Hype Specialist', `Sampaikan pada ${requesterName} bahwa permintaan film "${title}" telah diterima. Buat mereka sangat antusias!`);

    // 3. Notify Admin (Discord & Telegram)
    const discordUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    const adminMessage = `📥 *PERMINTAAN KONTEN BARU!*\n\n🎬 *Judul:* ${title}\n👤 *Peminta:* ${requesterName} (${platform})\n📅 *Waktu:* ${new Date().toLocaleString('id-ID')}\n\n*Instruksi:* Segera periksa ketersediaan link streaming untuk film ini.`;

    if (tgToken && tgChatId) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: adminMessage, parse_mode: 'Markdown' })
      });
    }

    if (discordUrl) {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "📥 NEW CONTENT REQUEST",
            description: adminMessage.replace(/\*/g, '**'),
            color: 0x9B59B6,
            image: { url: `https://image.tmdb.org/t/p/w500${movie.poster_path}` },
            footer: { text: "CineWatch Request System" }
          }]
        })
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: hypeResponse,
      movieDetails: { title, id: movie.id, type: movie.media_type }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
