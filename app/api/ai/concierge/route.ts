import { NextResponse } from 'next/server';
import { chatWithAgent, searchYou } from '@/services/ai';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function POST(req: Request) {
  try {
    const { query, userName } = await req.json();

    // STAGE 1: Intent Analysis & Strategy
    const searchTerms = await chatWithAgent('Search Strategist', `Extract search keywords from: "${query}". Return only keywords.`);
    const strategy = await chatWithAgent('Chief Concierge Strategy', `User "${userName}" asks: "${query}". Analyze the deep intent. Is it a news query, a recommendation request, or a technical question? Define the best research strategy.`);
    
    // STAGE 2: Multi-Source Intel Gathering
    console.log(`[CONCIERGE] Researching for ${userName}...`);
    const [tmdbRes, youRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(searchTerms)}&api_key=${TMDB_API_KEY}&language=id-ID`),
      researchYou(`Provide the absolute latest news, status, and reception for: ${query}. Focus on current status in 2026.`)
    ]);
    
    const searchData = await tmdbRes.json();
    const results = searchData.results?.slice(0, 3) || [];
    const deepIntel = youRes || 'No real-time intel found.';

    // STAGE 3: Personalized Elite Recommendation
    const recommendation = await chatWithAgent('Luxury Personal Butler', `Halo ${userName}, saya adalah asisten elit CineWatch Anda. User mencari "${query}".\n\nDatabase: ${results.map((r: any) => r.title || r.name).join(', ')}\n\nReal-Time Intel: ${deepIntel}\n\nStrategy: ${strategy}\n\nTask: Berikan jawaban yang sangat berkelas, informatif, dan "human-like". Jelaskan konteks berita terbaru jika ada. Gunakan Bahasa Indonesia yang sangat sopan dan profesional.`);

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
