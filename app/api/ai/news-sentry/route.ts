import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { researchYou, chatWithAgent, sendInternalLog } from '@/services/ai';

export async function GET(request: Request) {
  try {
    console.log("[SENTRY] Scanning the globe for Breaking News...");
    
    // 1. Web Research for Breaking News
    const searchResult = await researchYou("Breaking cinematic news movie series anime donghua May 14 2026. Only most recent trailers, leaks, or major industry shifts.");
    
    // 2. Intelligence Analysis
    const analysis = await chatWithAgent('Head of Intelligence', 
      `Search Results:\n${searchResult}\n\nTask: Apakah ada berita yang benar-benar "BREAKING" (Sangat penting/viral) dalam 24 jam terakhir? Jika ada, berikan judul dan ringkasan singkat. Jika tidak ada yang mendesak, jawab 'NONE'.`, 
      'Hyper-Alert'
    );

    if (analysis.includes('NONE') || analysis.includes('gangguan') || analysis.includes('Maaf')) {
      return NextResponse.json({ success: true, message: 'No breaking news detected or AI busy.' });
    }

    // 3. Robust Deduplication (Anti-Spam)
    const cleanAnalysis = analysis.slice(0, 50).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const slug = `sentry-v4-${cleanAnalysis}`;
    
    const { data: existing } = await supabase.from('posts').select('id').eq('slug', slug).maybeSingle();
    if (existing) return NextResponse.json({ success: true, message: 'News already processed.' });

    // 4. Record History IMMEDIATELY
    await supabase.from('posts').insert([{ 
      title: `Breaking News: ${analysis.slice(0, 50)}`, 
      slug: slug, 
      type: 'Bot History'
    }]);

    // 5. Emergency Board Meeting
    await sendInternalLog('Elite Intelligence Scout', `⚠️ SOS! BERITA BREAKING DETECTED: "${analysis.slice(0, 100)}..."`);
    
    const decision = await chatWithAgent('CEO', 
      `Breaking News: ${analysis}\n\nTask: Kita harus segera bereaksi! Berikan instruksi kepada tim redaksi untuk membuat artikel spesial 'Breaking News' sekarang juga.`, 
      'Commanding'
    );

    await sendInternalLog('CEO', `EMERGENCY MEETING: Kita akan mempublikasikan berita sela (Breaking News). Semua tim siaga!`);

    // 5. Trigger Generate News with 'breaking' flag (simulated or direct)
    // For now, we just record it. You can call the generate-news API here with a special query if needed.

    return NextResponse.json({ success: true, breakingNews: analysis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
