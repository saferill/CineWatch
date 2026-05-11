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
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

      if (callbackData === "trending") {
        const { getLatestTrendingMovies } = await import('@/services/movies');
        const trending = await getLatestTrendingMovies();
        let msg = "🔥 <b>TOP TRENDING NEXUS</b> 🔥\n\n";
        trending.results.slice(0, 5).forEach((m: any, i: number) => { 
          msg += `<b>${i+1}.</b> 🎬 <b>${m.title}</b>\n└ ⭐ ${m.vote_average.toFixed(1)} | 📅 ${(m.release_date || '').split('-')[0]}\n\n`; 
        });
        await sendToTelegramWithButtons(chatId, msg, [[{ text: "« Back to Nexus", callback_data: "start" }]]);
      }
      
      if (callbackData === "news") {
        const { supabase } = await import('@/lib/supabase');
        const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(3);
        let msg = "📰 <b>CINEWATCH LATEST NEWS</b>\n\n";
        posts?.forEach(p => { msg += `🔹 <b>${p.title}</b>\n└ <a href="${siteUrl}/blog/${p.slug}">Baca Selengkapnya...</a>\n\n`; });
        await sendToTelegramWithButtons(chatId, msg, [[{ text: "« Back to Nexus", callback_data: "start" }]]);
      }

      if (callbackData === "random") {
        const res = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_API_KEY}&language=id-ID&page=${Math.floor(Math.random() * 10) + 1}`);
        const data = await res.json();
        const m = data.results[Math.floor(Math.random() * data.results.length)];
        const posterUrl = `https://image.tmdb.org/t/p/w780${m.poster_path}`;
        const caption = `🎲 <b>HIDDEN GEM FOUND!</b>\n\n🎬 <b>${m.title}</b>\n⭐ Rating: ${m.vote_average.toFixed(1)}\n\n<i>${m.overview.slice(0, 150)}...</i>`;
        await sendPhotoWithButtons(chatId, posterUrl, caption, [[{ text: "🍿 Tonton Sekarang", url: `${siteUrl}/movie/${m.id}` }], [{ text: "« Back", callback_data: "start" }]]);
      }

      if (callbackData === "genres") {
        await sendToTelegramWithButtons(chatId, "🎭 <b>PILIH REALM SINEMATIK</b>\nSilakan pilih genre favorit Anda:", [
          [{ text: "Action 💥", callback_data: "genre_28" }, { text: "Horror 👻", callback_data: "genre_27" }],
          [{ text: "Sci-Fi 🚀", callback_data: "genre_878" }, { text: "Anime ⛩️", callback_data: "genre_16" }],
          [{ text: "« Kembali", callback_data: "start" }]
        ]);
      }

      if (callbackData === "start") {
        await sendToTelegramWithButtons(chatId, "<b>CINEWATCH AI - NEXUS COMMAND</b>", [
          [{ text: "🔥 Trending", callback_data: "trending" }, { text: "🗓️ Upcoming", callback_data: "upcoming" }],
          [{ text: "📰 Berita Terbaru", callback_data: "news" }, { text: "🎲 Hidden Gem", callback_data: "random" }],
          [{ text: "🎭 Jelajah Genre", callback_data: "genres" }]
        ]);
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Handle Commands with Buttons
    if (text.startsWith('/start') || text.startsWith('/help')) {
      await sendToTelegramWithButtons(chatId, 
        "<b>SYSTEM ONLINE: CINEWATCH NEXUS PRO</b> 🛸\n\n" +
        "Selamat datang, Komandan. Saya adalah unit AI tercanggih yang dirancang untuk mengoptimalkan pengalaman menonton Anda.\n\n" +
        "Pilih perintah di bawah atau ketik judul film apa pun:",
        [
          [{ text: "🔥 Trending", callback_data: "trending" }, { text: "🗓️ Upcoming", callback_data: "upcoming" }],
          [{ text: "📰 Berita Terbaru", callback_data: "news" }, { text: "🎲 Hidden Gem", callback_data: "random" }],
          [{ text: "🎭 Jelajah Genre", callback_data: "genres" }],
          [{ text: "🌐 Website Utama", url: "https://cinewatchh.vercel.app" }]
        ]
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/news') {
      // Trigger news logic
      return NextResponse.json({ ok: true });
    }

    // 3. Search Logic (Deep AI Intelligence)
    if (!text.startsWith('/')) {
      const query = text;
      
      // Use AI to extract key terms if complex
      const [movies, series] = await Promise.all([
        searchMovies(query),
        searchTVShows(query)
      ]);

      const results = [...movies.slice(0, 3), ...series.slice(0, 2)];
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

      if (results.length === 0) {
        await sendToTelegram(chatId, "⚠️ <b>SIGNAL LOST</b>\n\nMaaf, radar CineWatch tidak menemukan apa pun untuk <i>\"" + query + "\"</i>.\n\nTips: Gunakan judul asli atau kata kunci populer.");
      } else {
        const bestResult = results[0] as any;
        const posterUrl = `https://image.tmdb.org/t/p/w780${bestResult.poster_path}`;
        
        let recommendation = "";
        try {
          recommendation = await chatWithAgent(
            'CineWatch Elite Intel',
            `User mencari: "${query}". Film utama: ${bestResult.title || bestResult.name}. Berikan ulasan singkat yang SANGAT cerdas, mewah, dan membuat orang kagum. Gunakan gaya bahasa kritikus film kelas dunia.`,
            'World-Class, Sophisticated, Intelligence'
          );
          if (recommendation.includes("gangguan")) throw new Error("AI Busy");
        } catch (e) {
          recommendation = `Analisis AI: Film "${bestResult.title || bestResult.name}" adalah mahakarya yang wajib masuk dalam daftar tontonan Anda minggu ini.`;
        }

        const caption = `📽️ <b>INTELLIGENCE REPORT</b> 📽️\n\n${recommendation}\n\n🔍 <i>Hasil lainnya di bawah ini:</i>`;
        
        const buttons: any[][] = results.map((r: any) => ([{
          text: `🎬 ${r.title || r.name} (Sub Indo) - ${(r.release_date || r.first_air_date || '').split('-')[0]}`,
          url: `${r.title ? siteUrl + '/movie/' + r.id : siteUrl + '/series/' + r.id}`
        }]));
        
        buttons.push([{ text: "« Kembali ke Menu", callback_data: "start" }]);

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
