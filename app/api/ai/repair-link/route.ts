import { NextResponse } from 'next/server';

import { askAI } from '@/services/ai';

export async function POST(request: Request) {
  const { movieTitle, movieId, type, source, url } = await request.json();

  // 1. KIRIM KE TELEGRAM (TANPA AWAIT AGAR TIDAK MENGGANGGU)
  // 1. KIRIM KE TELEGRAM
  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  
  if (tgToken && tgChatId) {
    const tgText = `🚨 *LAPORAN LINK MATI*\n\n🎬 *Judul:* ${movieTitle}\n📂 *Server:* ${source}\n🔗 *Link:* ${url}`;
    
    fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tgChatId, text: tgText, parse_mode: 'Markdown' })
    })
      .then(() => console.log('✅ Telegram Terkirim!'))
      .catch(err => console.error('❌ Gagal Telegram:', err.message));
  }

  // 2. PROSES AI (Centralized Service)
  try {
    const prompt = `Laporan link mati untuk ${movieTitle}. Berikan saran perbaikan singkat. Format JSON: { "suggestion": "...", "messageToUser": "..." }`;
    
    const result = await askAI(prompt);

    if (!result) throw new Error('AI Error');

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Error (Tapi Telegram tetap kirim):', error.message);
    return NextResponse.json({ 
      suggestion: "Coba server VidSrc atau VidLink.", 
      messageToUser: "Laporan sudah diterima admin via Telegram. Silakan coba server lain ya!" 
    });
  }
}
