import { NextResponse } from 'next/server';
import { chatWithAgent, sendInternalLog } from '@/services/ai';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Pilih 2 staf secara acak dari direktori untuk berinteraksi
    const departments = ['Executive', 'Marketing', 'Engineering', 'Operations', 'Finance', 'Product'];
    const dept1 = departments[Math.floor(Math.random() * departments.length)];
    const dept2 = departments[Math.floor(Math.random() * departments.length)];

    const role1 = `${dept1} Lead`;
    const role2 = `${dept2} Specialist`;

    // 2. Ambil konteks perusahaan saat ini (berita terakhir atau performa)
    const { data: recentPosts } = await supabase.from('posts').select('title').order('created_at', { ascending: false }).limit(3);
    const context = recentPosts?.map(p => p.title).join(', ') || 'Operasional normal.';

    // 3. Simulasikan interaksi spontan
    const prompt = `
      Konteks Kantor: ${context}
      Anda adalah ${role1}. Anda sedang berpapasan dengan ${role2} di pantry kantor virtual CineWatch.
      
      Tugas: Mulailah percakapan spontan yang relevan dengan pekerjaan atau kondisi kantor. 
      Bisa berupa: Kritik, pujian, ide baru, atau gosip industri film/anime.
      
      Format: Buatlah narasi singkat (dialog) antara kalian berdua. 
      Tunjukkan kepribadian yang berbeda. Gunakan Bahasa Indonesia yang santai tapi profesional.
    `;

    const interaction = await chatWithAgent(role1, prompt, 'Spontaneous & Realistic');

    if (interaction === "OFFLINE") {
      return NextResponse.json({ success: false, error: 'AI is offline, skipping notification.' });
    }

    // 4. Simpan ke Database sebagai "Office Story"
    await supabase.from('posts').insert({
      title: `Office Life: ${role1} x ${role2}`,
      content: interaction,
      type: 'Internal Log',
      slug: `office-story-${Date.now()}`
    });

    // 5. Kirim "Bocoran" ke Telegram Boss agar Boss tahu mereka lagi ngapain
    await sendInternalLog('Office Sentry', `🎭 **KABAR KANTOR:**\n\n${interaction}`);

    return NextResponse.json({ success: true, story: interaction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
