import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/services/ai';
import { searchMovies, searchTVShows } from '@/app/lib/tmdb';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Telegram sends message in message object
    const message = body.message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text;

    // Handle commands
    if (text.startsWith('/start') || text.startsWith('/help')) {
      await sendToTelegram(chatId, 
        "<b>Selamat datang di CineWatch AI Pro!</b> 🎬✨\n\n" +
        "Saya adalah asisten pribadi Anda untuk menemukan tontonan terbaik. Berikut yang bisa saya lakukan:\n\n" +
        "🔍 <b>Cari Film/Series</b>: Ketik saja judulnya (misal: <i>Avatar</i>)\n" +
        "🔥 <b>/trending</b>: Lihat apa yang sedang populer hari ini\n" +
        "🗓️ <b>/upcoming</b>: Cek film yang akan segera tayang\n" +
        "❓ <b>/help</b>: Tampilkan pesan bantuan ini\n\n" +
        "Silakan ketik judul film yang ingin Anda tonton!"
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/trending')) {
      const { getLatestTrendingMovies } = await import('@/services/movies');
      const trending = await getLatestTrendingMovies();
      const top = trending.results.slice(0, 5);
      
      let msg = "🔥 <b>TRENDING HARI INI</b>\n\n";
      top.forEach((m: any, i: number) => {
        msg += `${i+1}. 🎬 <b>${m.title}</b> (⭐ ${m.vote_average.toFixed(1)})\n`;
      });
      await sendToTelegram(chatId, msg + "\nKetik judul film untuk info lebih lanjut!");
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/upcoming')) {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.TMDB_API_KEY}&language=id-ID&page=1`);
      const data = await res.json();
      const top = data.results.slice(0, 5);
      
      let msg = "🗓️ <b>SEGERA TAYANG</b>\n\n";
      top.forEach((m: any, i: number) => {
        msg += `• 🎬 <b>${m.title}</b> (${m.release_date})\n`;
      });
      await sendToTelegram(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // Default: Search
    if (!text.startsWith('/')) {
      const query = text;
      
      // 1. Search Logic
      const [movies, series] = await Promise.all([
        searchMovies(query),
        searchTVShows(query)
      ]);

      const results = [...movies.slice(0, 2), ...series.slice(0, 2)];
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app';

      if (results.length === 0) {
        await sendToTelegram(chatId, `Aduh, koleksi film saya belum menemukan "${query}". 😔\nCoba judul lain atau gunakan kata kunci yang lebih umum!`);
      } else {
        // 2. AI Presentation
        const recommendation = await chatWithAgent(
          'CineWatch Elite Concierge',
          `User mencari "${query}". Hasil: ${results.map((r: any) => r.title || r.name).join(', ')}. Berikan ulasan singkat yang SANGAT menggiurkan dan profesional agar user ingin segera menonton. Gunakan bahasa gaul tapi sopan.`,
          'Elegan, Cerdas, dan Cinematic'
        );

        const bestResult = results[0] as any;
        const posterUrl = `https://image.tmdb.org/t/p/w500${bestResult.poster_path}`;
        
        let responseText = `${recommendation}\n\n`;
        results.forEach((r: any) => {
          const type = r.title ? 'movie' : 'series';
          const url = `${siteUrl}/${type}/${r.id}`;
          responseText += `🎬 <b><a href="${url}">${r.title || r.name}</a></b> (${(r.release_date || r.first_air_date || '').split('-')[0]})\n`;
        });

        // Send with Photo if possible, else just text
        if (bestResult.poster_path) {
          await sendPhotoToTelegram(chatId, posterUrl, responseText);
        } else {
          await sendToTelegram(chatId, responseText);
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
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    })
  });
}

async function sendPhotoToTelegram(chatId: number, photoUrl: string, caption: string) {
  const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  if (!tgToken) return;

  await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl,
      caption: caption,
      parse_mode: 'HTML'
    })
  });
}
