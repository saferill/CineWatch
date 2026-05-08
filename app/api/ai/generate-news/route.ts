import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const ROUTER_ENDPOINT = 'http://localhost:20128/v1/chat/completions';

export async function GET() {
  const generatedArticles = [];
  const errors = [];

  try {
    // 1. Fetch Trending Movies
    const trendingRes = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${TMDB_API_KEY}`);
    const trendingData = await trendingRes.json();
    const results = trendingData.results;

    if (!results || results.length === 0) {
      return NextResponse.json({ error: 'No trending movies found' }, { status: 404 });
    }

    // Ambil maksimal 20 film
    const moviesToProcess = results.slice(0, 20);

    for (const movie of moviesToProcess) {
      try {
        const slug = movie.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        // 2. Cek apakah sudah ada
        const { data: existing } = await supabase
          .from('posts')
          .select('id')
          .eq('slug', slug)
          .single();

        if (existing) {
          console.log(`Skipping existing movie: ${movie.title}`);
          continue;
        }

        // 3. Generate Article using 9Router
        const prompt = `
          Tuliskan sebuah artikel blog SEO-friendly dalam Bahasa Indonesia tentang film trending terbaru berjudul "${movie.title}".
          Gunakan format Markdown. Pastikan artikel memiliki minimal 500 kata dan sangat persuasif.
          Tambahkan tag yang relevan.
        `;

        const aiRes = await fetch(ROUTER_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-3b8bb76c31c5d9f6-ou98nq-8db2a0be'
          },
          body: JSON.stringify({
            model: 'gemini/gemini-3.1-flash-lite-preview',
            messages: [{ role: 'user', content: prompt }],
            stream: false,
          }),
        });

        if (!aiRes.ok) {
          const errorText = await aiRes.text();
          errors.push(`Failed for ${movie.title}: ${errorText}`);
          continue;
        }

        const aiData = await aiRes.json();
        const articleContent = aiData.choices[0].message.content;

        // 4. Save to Supabase
        const { error: insertError } = await supabase
          .from('posts')
          .insert([
            {
              title: movie.title,
              slug: slug,
              content: articleContent,
              image: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
              type: 'trending',
              created_at: new Date().toISOString(),
            }
          ]);

        if (insertError) {
          errors.push(`Failed to save ${movie.title}: ${insertError.message}`);
        } else {
          generatedArticles.push(movie.title);
          // LOG IN TERMINAL
          console.log(`✅ [${generatedArticles.length}/20] Berhasil membuat artikel: ${movie.title}`);

          // 5. Send to Telegram (Hardcoded fix)
          // Notify Telegram
          const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
          const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
          if (tgToken && tgChatId) {
            const tgText = `📰 *ARTIKEL BARU TERBIT!*\n\n🔥 *Judul:* ${movie.title}\n🔗 *Baca di sini:* [${movie.title}](https://cinewatch.vercel.app/blog/${slug})\n\n🚀 *Update terus di CineWatch!*`;
            
            await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: tgChatId,
                text: tgText,
                parse_mode: 'Markdown'
              })
            });
          }
        }

      } catch (err: any) {
        errors.push(`Error processing ${movie.title}: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      message: `Proses Selesai! Berhasil membuat ${generatedArticles.length} artikel baru.`,
      success_list: generatedArticles,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Bulk AI Generator Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
