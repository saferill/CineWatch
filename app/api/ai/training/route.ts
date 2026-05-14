import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent, sendInternalLog } from '@/services/ai';

export async function GET(request: Request) {
  try {
    console.log("[ACADEMY] Starting Daily Corporate Training Session...");
    
    // 1. Ambil artikel dari 24 jam terakhir
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('title, content')
      .gte('created_at', yesterday.toISOString())
      .limit(5);

    if (!recentPosts || recentPosts.length === 0) {
      await sendInternalLog('CEO', 'Sesi pelatihan dibatalkan karena tidak ada data performa kemarin. Tim diperintahkan untuk tetap waspada.');
      return NextResponse.json({ success: true, message: 'No data to learn from' });
    }

    const performanceData = recentPosts.map(p => `Judul: ${p.title}\nIsi: ${p.content?.slice(0, 300)}...`).join('\n\n');

    // 2. Evaluasi oleh QA Critic & CEO
    const trainingResults = await chatWithAgent('CineWatch Academy Director', 
      `Data Performa Kemarin:\n${performanceData}\n\nTask: Analisis kelemahan tim redaksi kemarin. Berikan 3 instruksi baru yang harus diikuti oleh SEMUA staff mulai hari ini agar kualitas CineWatch meningkat secara eksklusif.`, 
      'Hyper-Analytical & Strict'
    );

    // 3. Simpan ke Corporate Memory
    await supabase.from('posts').insert([{
      title: `Corporate Memory: Learning Session ${new Date().toLocaleDateString()}`,
      content: trainingResults,
      slug: `memory-${Date.now()}`,
      type: 'Bot History' // Kita gunakan type ini agar tidak muncul di web sebagai artikel
    }]);

    // 4. Update Level Staff (Visual Only for Boss)
    await sendInternalLog('CEO', `Sesi Pelatihan Selesai. Tim telah mengasimilasi pengetahuan baru:\n\n"${trainingResults.slice(0, 200)}..."\n\nLevel Intelektual Tim: MENINGKAT 📈`);

    return NextResponse.json({ success: true, trainingResults });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
