import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent, sendInternalLog } from '@/services/ai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // 1. Ambil semua aktifitas dalam 1 jam terakhir
    const { data: logs } = await supabase
      .from('posts')
      .select('title, content, type')
      .gt('created_at', oneHourAgo)
      .in('type', ['Internal Log', 'Bot History', 'Corporate Wisdom'])
      .order('created_at', { ascending: false });

    if (!logs || logs.length === 0) {
      return NextResponse.json({ success: true, message: 'No activity in the last hour.' });
    }

    // 2. Minta Managing Editor merangkum semuanya
    const activitySummary = logs.map(l => `[${l.type}] ${l.title}: ${l.content?.slice(0, 100)}`).join('\n');
    
    const summaryPrompt = `
      Berikut adalah aktivitas kantor CineWatch dalam 60 menit terakhir:
      ${activitySummary}
      
      Tugas: Buat satu ringkasan eksekutif yang sangat mewah dan profesional untuk Boss. 
      Kelompokkan berdasarkan: 
      - 🎬 RILIS TERBARU
      - 📰 BERITA BREAKING
      - 🎭 DINAMIKA KANTOR (Office Life)
      
      Gunakan Bahasa Indonesia yang elegan. Jangan terlalu panjang, fokus pada poin penting saja.
    `;

    const executiveReport = await chatWithAgent('Managing Editor', summaryPrompt, 'Executive & Concise');

    // 3. Kirim SATU pesan rangkuman ke Telegram
    await sendInternalLog('Managing Editor', `💎 **HOURLY EXECUTIVE REPORT** 💎\n\n${executiveReport}\n\n━━━━━━━━━━━━━━━━━━━━\nLaporan berikutnya akan tersedia dalam 60 menit.`);

    return NextResponse.json({ success: true, report: executiveReport });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
