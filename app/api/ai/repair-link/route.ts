import { NextResponse } from 'next/server';

const ROUTER_ENDPOINT = 'http://localhost:20128/v1/chat/completions';

export async function POST(request: Request) {
  const { movieTitle, movieId, type, source, url } = await request.json();

  // 1. KIRIM KE TELEGRAM (TANPA AWAIT AGAR TIDAK MENGGANGGU)
  const tgToken = '8750051839:AAF0flN7kcr5Yr0N-HxQySoBkKMSAbkbI_Y';
  const tgChatId = '5666111637';
  
  const tgText = `🚨 *LAPORAN LINK MATI*\n\n🎬 *Judul:* ${movieTitle}\n📂 *Server:* ${source}\n🔗 *Link:* ${url}`;
  
  fetch(`https://api.telegram.org/bot${tgToken}/sendMessage?chat_id=${tgChatId}&text=${encodeURIComponent(tgText)}&parse_mode=Markdown`)
    .then(() => console.log('✅ Telegram Terkirim!'))
    .catch(err => console.error('❌ Gagal Telegram:', err.message));

  // 2. PROSES AI (9Router)
  try {
    const prompt = `Laporan link mati untuk ${movieTitle}. Berikan saran perbaikan singkat. Format JSON: { "suggestion": "...", "messageToUser": "..." }`;
    
    const aiRes = await fetch(ROUTER_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-3b8bb76c31c5d9f6-ou98nq-8db2a0be'
      },
      body: JSON.stringify({
        model: 'gemini/gemini-3.1-flash-lite-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        stream: false
      }),
    });

    if (!aiRes.ok) throw new Error('AI Down');

    const aiData = await aiRes.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Error (Tapi Telegram tetap kirim):', error.message);
    return NextResponse.json({ 
      suggestion: "Coba server VidSrc atau VidLink.", 
      messageToUser: "Laporan sudah diterima admin via Telegram. Silakan coba server lain ya!" 
    });
  }
}
