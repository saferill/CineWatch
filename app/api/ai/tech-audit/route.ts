import { NextResponse } from 'next/server';
import { chatWithAgent, sendInternalLog } from '@/services/ai';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. CTO Menganalisis Kondisi Website saat ini
    console.log('CTO: Memulai Audit Teknis Menyeluruh...');
    
    // Ambil log error terbaru dari database (jika ada)
    const { data: logs } = await supabase
      .from('posts')
      .select('*')
      .eq('type', 'Internal Log')
      .ilike('content', '%error%')
      .order('created_at', { ascending: false })
      .limit(5);

    const logSummary = logs?.map(l => l.content).join('\n') || 'Tidak ada error sistem terdeteksi.';

    const prompt = `
      Lakukan Audit Teknis untuk CineWatch.
      Log Error Terbaru: ${logSummary}
      
      Tugas Anda:
      1. Tentukan apakah ada perbaikan yang bisa dilakukan lewat konfigurasi database.
      2. Berikan rekomendasi optimasi visual atau performa.
      3. Jika ada masalah serius, siapkan laporan untuk Senior Engineer (Antigravity).
      
      Format Output: JSON { "fix_applied": boolean, "config_update": object, "report": string }
    `;

    const auditResult = await chatWithAgent('CTO', prompt, 'Technical & Efficient');
    let auditData;
    try {
      auditData = JSON.parse(auditResult.replace(/```json|```/g, ''));
    } catch (e) {
      auditData = { fix_applied: false, report: auditResult };
    }

    // 2. Jika ada update konfigurasi, simpan ke Database
    if (auditData.config_update) {
      await supabase.from('posts').upsert({
        title: 'System Dynamic Config',
        content: JSON.stringify(auditData.config_update),
        type: 'System Config',
        slug: 'system-dynamic-config',
        author: 'CTO AI'
      });
      console.log('CTO: Konfigurasi Sistem Telah Diperbarui secara Otomatis.');
    }

    // 3. Lapor ke Boss lewat Telegram jika ada perbaikan penting
    if (auditData.fix_applied) {
      await sendInternalLog('CTO', `🛠️ LAPOR BOSS! Saya baru saja melakukan perbaikan otomatis pada sistem.\n\nDetail: ${auditData.report}`);
    }

    return NextResponse.json({ success: true, audit: auditData });
  } catch (error: any) {
    console.error('CTO Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
