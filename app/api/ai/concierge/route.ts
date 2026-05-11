import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/services/ai';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function POST(req: Request) {
  try {
    const { query, userName } = await req.json();

    // 1. AI Analysis: What is the user looking for?
    const searchTerms = await chatDevAgent('Search Strategist', `Ekstrak kata kunci pencarian film dari permintaan ini: "${query}". Kembalikan hanya kata kuncinya saja.`);
    
    // 2. Fetch from TMDB
    const searchRes = await fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(searchTerms)}&api_key=${TMDB_API_KEY}&language=id-ID`);
    const searchData = await searchRes.json();
    const results = searchData.results?.slice(0, 3) || [];

    if (results.length === 0) {
      return NextResponse.json({ 
        message: `Halo ${userName}, maaf saya belum menemukan film yang cocok dengan "${query}". Coba kata kunci lain?` 
      });
    }

    // 3. AI Presentation: Create an elegant recommendation
    const recommendation = await chatWithAgent('Chief Concierge', `Halo ${userName}, user mencari "${query}". Kami menemukan: ${results.map((r: any) => r.title || r.name).join(', ')}. Berikan rekomendasi yang sangat menarik dan jelaskan kenapa ini cocok untuk mereka.`);

    return NextResponse.json({ 
      success: true, 
      message: recommendation,
      results: results.map((r: any) => ({
        title: r.title || r.name,
        id: r.id,
        type: r.media_type,
        poster: `https://image.tmdb.org/t/p/w500${r.poster_path}`
      }))
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
