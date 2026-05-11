import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/services/ai';
import { searchMovies, searchTVShows } from '@/app/lib/tmdb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const message = body.message || body.callback_query?.message;
    const callback_query = body.callback_query;
    
    if (!message && !callback_query) return NextResponse.json({ ok: true });

    const chatId = message?.chat?.id || callback_query?.from?.id;
    const text = message?.text || "";
    const callbackData = callback_query?.data || "";

    // 1. Handle Callback Queries (Button Clicks)
    if (callbackData) {
      if (callbackData === "trending") {
        const { getLatestTrendingMovies } = await import('@/services/movies');
        const trending = await getLatestTrendingMovies();
        const top = trending.results.slice(0, 5);
        let msg = "🔥 <b>TRENDING HARI INI</b>\n\n";
        top.forEach((m: any, i: number) => { msg += `${i+1}. 🎬 <b>${m.title}</b> (⭐ ${m.vote_average.toFixed(1)})\n`; });
        await sendToTelegramWithButtons(chatId, msg, [[{ text: "« Kembali", callback_data: "start" }]]);
      }
      
      if (callbackData === "upcoming") {
        const res = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.TMDB_API_KEY}&language=id-ID&page=1`);
        const data = await res.json();
        let msg = "🗓️ <b>SEGERA TAYANG</b>\n\n";
        data.results.slice(0, 5).forEach((m: any) => { msg += `• 🎬 <b>${m.title}</b> (${m.release_date})\n`; });
        await sendToTelegramWithButtons(chatId, msg, [[{ text: "« Kembali", callback_data: "start" }]]);
      }

      if (callbackData === "genres") {
        await sendToTelegramWithButtons(chatId, "🎭 <b>PILIH GENRE FAVORIT</b>", [
          [{ text: "Action 💥", callback_data: "genre_28" }, { text: "Horror 👻", callback_data: "genre_27" }],
          [{ text: "Comedy 😂", callback_data: "genre_35" }, { text: "Sci-Fi 🚀", callback_data: "genre_878" }],
          [{ text: "« Kembali", callback_data: "start" }]
        ]);
      }

      if (callbackData === "start") {
        await sendToTelegramWithButtons(chatId, "<b>Pusat Kendali CineWatch AI</b>", [
          [{ text: "🔥 Trending", callback_data: "trending" }, { text: "🗓️ Upcoming", callback_data: "upcoming" }],
          [{ text: "🎭 Genres", callback_data: "genres" }]
        ]);
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Handle Commands with Buttons
    if (text.startsWith('/start') || text.startsWith('/help')) {
      await sendToTelegramWithButtons(chatId, 
        "<b>CINEWATCH AI PRO - NEXUS COMMAND</b> 🛸\n\n" +
        "Selamat datang di pusat kendali sinematik Anda. Saya adalah AI Elite yang akan memandu Anda menemukan mahakarya layar lebar.\n\n" +
        "Pilih salah satu menu di bawah ini untuk memulai:",
        [
          [{ text: "🔥 Trending Sekarang", callback_data: "trending" }, { text: "🗓️ Segera Tayang", callback_data: "upcoming" }],
          [{ text: "🎭 Jelajah Genre", callback_data: "genres" }],
          [{ text: "🌐 Buka Website", url: "https://cinewatchh.vercel.app" }]
        ]
      );
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Genre Selection (Simplified for now)
    if (text === '/genres' || text === 'genres') {
      await sendToTelegramWithButtons(chatId, "Pilih genre yang Anda sukai:", [
        [{ text: "Action 💥", callback_data: "genre_28" }, { text: "Horror 👻", callback_data: "genre_27" }],
        [{ text: "Comedy 😂", callback_data: "genre_35" }, { text: "Sci-Fi 🚀", callback_data: "genre_878" }],
        [{ text: "« Kembali", callback_data: "start" }]
      ]);
      return NextResponse.json({ ok: true });
    }

    // 3. Search Logic (Enhanced)
    if (!text.startsWith('/')) {
      const query = text;
      const [movies, series] = await Promise.all([
        searchMovies(query),
        searchTVShows(query)
      ]);

      const results = [...movies.slice(0, 3), ...series.slice(0, 2)];
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

      if (results.length === 0) {
        await sendToTelegram(chatId, "⚠️ <b>DATA NOT FOUND</b>\n\nMaaf, radar kami tidak menemukan sinyal untuk <i>\"" + query + "\"</i>. Coba gunakan judul yang berbeda!");
      } else {
        const bestResult = results[0] as any;
        const posterUrl = `https://image.tmdb.org/t/p/w780${bestResult.poster_path}`;
        
        // AI Curation with Robust Fallback
        let recommendation = "";
        try {
          recommendation = await chatWithAgent(
            'CineWatch Master Intelligence',
            `User mencari "${query}". Film terbaik: ${bestResult.title || bestResult.name}. Berikan 1 kalimat promosi yang sangat eksklusif dan mewah.`,
            'High-End, Futuristic, and Compelling'
          );
          if (recommendation.includes("gangguan")) throw new Error("AI Busy");
        } catch (e) {
          recommendation = `Film "${bestResult.title || bestResult.name}" adalah pilihan luar biasa untuk tontonan Anda malam ini.`;
        }

        let caption = `💎 <b>CINEWATCH SELECTION</b> 💎\n\n`;
        caption += `✨ ${recommendation}\n\n`;
        
        const buttons = results.map((r: any) => ([{
          text: `🎬 ${r.title || r.name} (${(r.release_date || r.first_air_date || '').split('-')[0]})`,
          url: `${r.title ? siteUrl + '/movie/' + r.id : siteUrl + '/series/' + r.id}`
        }]));

        if (bestResult.poster_path) {
          await sendPhotoWithButtons(chatId, posterUrl, caption, buttons);
        } else {
          await sendToTelegramWithButtons(chatId, caption, buttons);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('TG Webhook Error:', error.message);
    return NextResponse.json({ ok: true }); // Always return OK to TG
  }
}

async function sendToTelegram(chatId: number, text: string) {
  const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  if (!tgToken) return;
  await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  });
}

async function sendToTelegramWithButtons(chatId: number, text: string, buttons: any[]) {
  const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  if (!tgToken) return;
  await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons }
    })
  });
}

async function sendPhotoWithButtons(chatId: number, photoUrl: string, caption: string, buttons: any[]) {
  const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  if (!tgToken) return;
  await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons }
    })
  });
}
