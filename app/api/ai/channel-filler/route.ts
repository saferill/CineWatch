import { NextResponse } from 'next/server';
import { chatWithAgent } from '@/services/ai';
import { searchMovies } from '@/app/lib/tmdb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChannelId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

    if (!tgToken || !tgChannelId) {
      return NextResponse.json({ error: 'Telegram config missing' }, { status: 500 });
    }

    const today = new Date().toISOString().split('T')[0];
    const results = [];
    let attempts = 0;
    const maxItems = 3;

    // Loop until we get 3 UNIQUE movies
    while (results.length < maxItems && attempts < 15) {
      attempts++;
      const categories = ['movie', 'tv', 'anime', 'donghua'];
      const type = categories[Math.floor(Math.random() * categories.length)];
      const page = Math.floor(Math.random() * 10) + 1; // Wider search to find unique items
      
      let endpoint = "";
      if (type === 'movie') {
        endpoint = `/discover/movie?primary_release_date.lte=${today}&sort_by=popularity.desc&vote_average.gte=6&with_release_type=2|3|4&language=id-ID&page=${page}`;
      } else {
        const genreParam = type === 'anime' ? '&with_genres=16' : type === 'donghua' ? '&with_origin_country=CN' : '';
        endpoint = `/discover/tv?first_air_date.lte=${today}&sort_by=popularity.desc&vote_average.gte=6${genreParam}&language=id-ID&page=${page}`;
      }

      const res = await fetch(`https://api.themoviedb.org/3${endpoint}&api_key=${process.env.TMDB_API_KEY}`);
      const data = await res.json();
      let items = data.results || [];
      
      if (items.length === 0) continue;
      
      const item = items[Math.floor(Math.random() * items.length)];
      const mediaId = item.id;
      const historySlug = `bot-history-${mediaId}-${type}`;

      // --- ANTI-DUPLICATE CHECK ---
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', historySlug)
        .single();

      if (existing) {
        console.log(`⏭️ Skipping duplicate: ${item.title || item.name}`);
        continue;
      }
      // ----------------------------

      const title = item.title || item.name;
      const year = (item.release_date || item.first_air_date || '').split('-')[0];
      const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}/10` : '⭐ N/A';
      
      // Get Genres names (Simplified)
      const genreMap: any = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western' };
      const genres = item.genre_ids?.slice(0, 2).map((id: number) => genreMap[id] || 'General').join(', ') || 'Sinema';

      // 3. AI Hype Generation with Silent Fallback
      let hype = "";
      try {
        hype = await chatWithAgent(
          'Luxury Critic',
          `Promosikan film "${title}" (${year}) genre ${genres}. Berikan 1 kalimat mewah yang mengundang orang menonton.`,
          'Sophisticated and High-End'
        );
        if (hype.includes("gangguan") || hype.includes("Maaf")) throw new Error("AI Error");
      } catch (e) {
        hype = item.overview ? item.overview.slice(0, 150) + "..." : "Saksikan mahakarya sinematik ini hanya di CineWatch.";
      }

      const message = `🎬 <b>CINEWATCH PREMIER</b> 🎬\n` +
                      `━━━━━━━━━━━━━━━━━━\n\n` +
                      `🔥 <b>${title.toUpperCase()}</b> (${year})\n\n` +
                      `🌟 <b>Rating:</b> ${rating}\n` +
                      `🎭 <b>Genre:</b> ${genres}\n` +
                      `🇮🇩 <b>Subtitle:</b> Indonesia (Aktif)\n` +
                      `🎥 <b>Kualitas:</b> 1080p Full HD\n\n` +
                      `📝 <i>"${hype}"</i>\n\n` +
                      `━━━━━━━━━━━━━━━━━━\n` +
                      `🚀 <a href="${siteUrl}/${item.title ? 'movie' : 'series'}/${item.id}/watch">MULAI NONTON SEKARANG</a>`;

      const posterUrl = `https://image.tmdb.org/t/p/w780${item.poster_path}`;

      // Send to Telegram
      await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgChannelId,
          photo: posterUrl,
          caption: message,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: "🍿 Tonton / Download Sub Indo", url: `${siteUrl}/${item.title ? 'movie' : 'series'}/${item.id}/watch` }]]
          }
        })
      });

      // --- SAVE TO HISTORY ---
      await supabase.from('posts').insert([{
        title: `History: ${title}`,
        slug: historySlug,
        content: `Sent to Telegram at ${new Date().toISOString()}`,
        type: 'Bot History',
        image: posterUrl
      }]);
      
      results.push(title);
      await new Promise(r => setTimeout(r, 3000)); // Delay between posts
    }

    return NextResponse.json({ success: true, posted: results });

  } catch (error: any) {
    console.error('Channel Filler Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
