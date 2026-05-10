import { NextResponse } from 'next/server';
import { askAIStream } from '@/services/ai';
import { getTrending, searchMovies, searchTVShows } from '@/app/lib/tmdb';

export async function POST(request: Request) {
  try {
    const { message, history, pageContext } = await request.json();
    
    // 1. Fetch real-time context
    const trending = await getTrending();
    const trendingList = trending.slice(0, 10).map(m => `${m.title} (${m.vote_average})`).join(', ');

    // 2. Format history for the AI
    const historyContext = history?.map((m: any) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n') || '';

    // 3. Smart Search & Deep Info
    let searchContext = '';
    if (message.length > 3) {
      const [mResults, sResults] = await Promise.all([
        searchMovies(message),
        searchTVShows(message)
      ]);
      
      const allResults = [...mResults.slice(0, 5), ...sResults.slice(0, 5)];
      if (allResults.length > 0) {
        searchContext = `\n\nDATABASE CINEWATCH (Real-time):\n` + 
          allResults.map(m => {
            const id = (m as any).id;
            const type = (m as any).title ? 'movie' : 'tv';
            const title = m.title || (m as any).name;
            const poster = (m as any).poster_path;
            return `- [ID:${id}] ${title} (${(m as any).release_date || (m as any).first_air_date}): ${m.overview} (Poster: ${poster})`;
          }).join('\n');
      }
    }

    const systemPrompt = `Kamu adalah CineWatch Elite AI, asisten pakar film yang sangat efisien dan cerdas.
    Waktu: Mei 2026.
    
    KONTEKS HALAMAN SAAT INI:
    User sedang membuka: "${pageContext?.title}"

    RIWAYAT OBROLAN:
    ${historyContext}

    DATA REAL-TIME:
    Trending: ${trendingList}
    ${searchContext}

    Tugas Utama:
    1. JANGAN memberikan trivia atau fakta random kecuali user secara spesifik memintanya.
    2. LANGSUNG ke inti jawaban. Jadilah efisien dan jangan membuang waktu user dengan basa-basi atau info tambahan yang tidak relevan dengan pertanyaan.
    3. Gunakan format KARTU INTERAKTIF [[REK:ID:TYPE:TITLE:POSTER_PATH]] jika user meminta rekomendasi atau jika sangat relevan dengan topik.
    4. Jawaban harus cerdas, akurat, dan teknis, tapi tetap SINGKAT dan PADAT.
    5. Selalu pahami konteks halaman saat ini agar jawabanmu tetap akurat terhadap apa yang dilihat user.`;
    
    const prompt = `${systemPrompt}\n\nUser: ${message}\nAI:`;
    
    const streamRes = await askAIStream(prompt);
    
    if (!streamRes) throw new Error('AI Error');
    
    return new Response(streamRes.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Maaf, asisten cerdas sedang sinkronisasi database. Coba lagi nanti ya!" }, { status: 500 });
  }
}
