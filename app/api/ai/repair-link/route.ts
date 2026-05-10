import { NextResponse } from 'next/server';

import { askAI } from '@/services/ai';

export async function POST(request: Request) {
  const { movieTitle, movieId, type, source, url } = await request.json();

  // 1. KIRIM KE TELEGRAM (TANPA AWAIT AGAR TIDAK MENGGANGGU)
  const tgToken = '8750051839:AAF0flN7kcr5Yr0N-HxQySoBkKMSAbkbI_Y';
  const tgChatId = '5666111637';
  
  const tgText = `🚨 *LAPORAN LINK MATI*\n\n🎬 *Judul:* ${movieTitle}\n📂 *Server:* ${source}\n🔗 *Link:* ${url}`;
  
  fetch(`https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${tgChatId}&text=${encodeURIComponent(tgText)}&parse_mode=Markdown`)
    .then(() => console.log('✅ Telegram Terkirim!'))
    .catch(err => console.error('❌ Gagal Telegram:', err.message));

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
