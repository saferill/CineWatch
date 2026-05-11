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
    if (text.startsWith('/start')) {
      await sendToTelegram(chatId, "Halo! Saya adalah CineWatch AI Bot. 🎬\n\nKetik apa saja untuk mencari film, atau gunakan perintah /search [judul].");
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/search ') || !text.startsWith('/')) {
      const query = text.replace('/search ', '');
      
      // 1. Search Logic
      const [movies, series] = await Promise.all([
        searchMovies(query),
        searchTVShows(query)
      ]);

      const results = [...movies.slice(0, 2), ...series.slice(0, 2)];
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app';

      if (results.length === 0) {
        await sendToTelegram(chatId, `Maaf, saya tidak menemukan hasil untuk "${query}". 😔`);
      } else {
        // 2. AI Presentation
        const recommendation = await chatWithAgent(
          'Telegram Concierge',
          `User mencari "${query}". Kami menemukan: ${results.map((r: any) => r.title || r.name).join(', ')}. Berikan jawaban singkat dan ramah dengan link berikut.`,
          'Ramah dan Membantu'
        );

        let responseText = `${recommendation}\n\n`;
        results.forEach((r: any) => {
          const type = r.title ? 'movie' : 'series';
          const url = `${siteUrl}/${type}/${r.id}`;
          responseText += `🎬 <b><a href="${url}">${r.title || r.name}</a></b>\n`;
        });

        await sendToTelegram(chatId, responseText);
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
