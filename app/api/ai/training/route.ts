import { NextResponse } from 'next/server';
import { chatWithAgent, sendInternalLog } from '@/services/ai';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("[ACADEMY] Starting daily training session...");
    
    // 1. Ambil Log Kerja Terbaru (Cerita Kantor & Hasil Kerja)
    const { data: logs } = await supabase
      .from('posts')
      .select('title, content')
      .in('type', ['Internal Log', 'Bot History'])
      .order('created_at', { ascending: false })
      .limit(20);

    const archiveData = logs?.map(l => `[${l.title}]: ${l.content.slice(0, 200)}`).join('\n\n') || 'Tidak ada data log hari ini.';

    // 2. Academy Director menganalisis pola kesalahan atau keberhasilan
    const evolutionPrompt = `
      Anda adalah Academy Director CineWatch. Berikut adalah catatan operasional kantor hari ini:
      ${archiveData}
      
      Tugas:
      1. Identifikasi pola kerja yang sukses dan yang gagal (misal: spam Telegram, tone bahasa yang kurang mewah, dll).
      2. Tuliskan 5-7 poin "Pelajaran Berharga" (Corporate Wisdom) untuk diinjeksi ke otak semua staf besok.
      3. Fokus pada peningkatan kualitas dan efisiensi.
      
      Format: List poin-poin strategis dalam Bahasa Indonesia yang berwibawa.
    `;

    const newWisdom = await chatWithAgent('Academy Director', evolutionPrompt, 'Educational & Strategic');

    // 3. Simpan ke Database sebagai Update Otak Terbaru
    await supabase.from('posts').insert({
      title: `Corporate Wisdom: ${new Date().toLocaleDateString()}`,
      content: newWisdom,
      type: 'Corporate Wisdom',
      slug: `wisdom-${Date.now()}`
    });

    // 4. Lapor ke Boss bahwa staf sudah di-upgrade otaknya
    await sendInternalLog('Academy Director', `🧠 **UPGRADE OTAK SELESAI:**\nSeluruh staf telah diberikan "Kearifan Baru" hari ini.\n\nFokus Belajar:\n${newWisdom.slice(0, 300)}...`);

    return NextResponse.json({ success: true, wisdom: newWisdom });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
