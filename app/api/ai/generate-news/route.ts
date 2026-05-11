import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent } from '@/services/ai';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function fetchTMDB(endpoint: string) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`);
  return res.json();
}

// Notification Helper
async function notifyAll(title: string, slug: string, item: any, category: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';
  const url = `${siteUrl}/blog/${slug}`;
  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const mainChannelId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const animeChannelId = process.env.TELEGRAM_ANIME_CHANNEL_ID;
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.DISCORD_RELEASE_WEBHOOK_URL;

  const isAnimeDonghua = category === 'Anime' || category === 'Donghua';
  const targetChannel = isAnimeDonghua ? animeChannelId : mainChannelId;

  if (!targetChannel || !tgToken) return;

  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}/10` : '⭐ N/A';

  const tgText = `📰 <b>CINEWATCH INSIDER</b>\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n\n` +
                  `🔥 <b>${title.toUpperCase()}</b> (${year})\n\n` +
                  `🌟 <b>Rating:</b> ${rating}\n` +
                  `📝 Sebuah ulasan mendalam tentang mahakarya ini baru saja diterbitkan di blog eksklusif kami.\n\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `🎬 <b>CineWatch Intel Protocol v2.0</b>\n` +
                  `🔗 <a href="${url}">BACA ULASAN LENGKAP</a>`;

  try {
    await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: targetChannel, 
        photo: `https://image.tmdb.org/t/p/w780${item.backdrop_path || item.poster_path}`,
        caption: tgText, 
        parse_mode: 'HTML' 
      })
    });
  } catch (e) {
    console.error('Telegram notification error:', e);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const generatedArticles = [];

  try {
    const [moviesData, tvData] = await Promise.all([
      fetchTMDB('/trending/movie/day?language=id-ID'),
      fetchTMDB('/trending/tv/day?language=id-ID'),
    ]);

    const items = [
      ...(moviesData.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Movie' })),
      ...(tvData.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Series' })),
    ];

    for (const item of items) {
      const targetChannel = mainChannelId;

      const historySlug = `news-v2-${item.id}-${item.type}-${targetChannel}`;

      const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
      if (existing) continue;

      const title = item.title || item.name;
      const [romanticDraft, realismDraft, magicalDraft] = await Promise.all([
        chatWithAgent('Romanticism Writer', `Review ${item.type}: "${title}".`, 'Emosional'),
        chatWithAgent('Realism Writer', `Review ${item.type}: "${title}".`, 'Faktual'),
        chatWithAgent('Magical Realism Writer', `Review ${item.type}: "${title}".`, 'Futuristik')
      ]);

      let finalArticle = await chatWithAgent('Chief Editor', `Synthesize these reviews for "${title}":\n\n1: ${romanticDraft}\n2: ${realismDraft}\n3: ${magicalDraft}`, 'Professional');
      if (finalArticle.includes("gangguan") || finalArticle.includes("Maaf")) {
         finalArticle = item.overview || "Mahakarya sinematik terbaru di CineWatch.";
      }

      const slug = `insider-${item.id}-${new Date().getTime()}`;
      await supabase.from('posts').insert([{ title: `History: News ${title}`, slug: historySlug, type: 'Bot History' }]);
      await supabase.from('posts').insert([{
        title: `${item.type} Spotlight: ${title}`,
        slug: slug,
        content: finalArticle,
        image: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1280',
        type: `${item.type} Intel`
      }]);
      
      await notifyAll(`${item.type} Spotlight: ${title}`, slug, item, item.type);
      generatedArticles.push(title);
    }

    return NextResponse.json({ success: true, total_generated: generatedArticles.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

