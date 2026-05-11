import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent } from '@/services/ai';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function fetchTMDB(endpoint: string) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`);
  return res.json();
}

// Notification Helper
async function notifyAll(title: string, slug: string, item: any) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';
  const url = `${siteUrl}/blog/${slug}`;
  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.DISCORD_RELEASE_WEBHOOK_URL;

  const year = (item.release_date || item.first_air_date || '').split('-')[0];
  const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}/10` : '⭐ N/A';

  // 1. Telegram
  if (tgToken && tgChatId) {
    const tgText = `📰 <b>CINEWATCH INSIDER</b>\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `🔥 <b>${title.toUpperCase()}</b> (${year})\n\n` +
                    `🌟 <b>Rating:</b> ${rating}\n` +
                    `📝 Sebuah ulasan mendalam tentang mahakarya ini baru saja diterbitkan di blog eksklusif kami.\n\n` +
                    `━━━━━━━━━━━━━━━━━━\n` +
                    `🔗 <a href="${url}">BACA ULASAN LENGKAP</a>`;
    try {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: tgChatId, 
          photo: `https://image.tmdb.org/t/p/w780${item.backdrop_path || item.poster_path}`,
          caption: tgText, 
          parse_mode: 'HTML' 
        })
      });
    } catch (e) {
      console.error('Telegram notification error:', e);
    }
  }

  // 2. Discord
  if (discordUrl) {
    try {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: `📰 CineWatch Insider: ${title}`,
            description: `**Rating:** ${rating}\n\nSebuah mahakarya kolaborasi multi-agen ChatDev baru saja diterbitkan.`,
            url: url,
            color: 0x00BFFF,
            image: { url: `https://image.tmdb.org/t/p/w1280${item.backdrop_path || item.poster_path}` },
            footer: { text: "CineWatch Intelligence System" },
            timestamp: new Date().toISOString()
          }]
        })
      });
    } catch (e) {
      console.error('Discord notification error:', e);
    }
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
  const errors = [];

  try {
    console.log('📰 AI: Starting News Generation...');
    
    // 1. DATA GATHERING
    const [moviesData, tvData, animeData, donghuaData] = await Promise.all([
      fetchTMDB('/trending/movie/day?language=id-ID'),
      fetchTMDB('/trending/tv/day?language=id-ID'),
      fetchTMDB('/discover/tv?with_genres=16&sort_by=popularity.desc&language=id-ID'),
      fetchTMDB('/discover/tv?with_origin_country=CN&sort_by=popularity.desc&language=id-ID'),
    ]);

    const items = [
      ...(moviesData.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Movie' })),
      ...(tvData.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Series' })),
      ...(animeData.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Anime' })),
      ...(donghuaData.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Donghua' })),
    ];

    for (const item of items) {
      try {
        const historySlug = `news-history-${item.id}-${item.type}`;

        // ANTI-DUPLICATE CHECK
        const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
        if (existing) {
          console.log(`⏭️ News already exists for: ${item.title || item.name}`);
          continue;
        }

        const title = item.title || item.name;
        const overview = item.overview || 'Trending content on CineWatch.';
        console.log(`🎬 ChatDev Deep-Dive: ${title} (${item.type})`);

        // AI WORKFLOW
        const [romanticDraft, realismDraft, magicalDraft] = await Promise.all([
          chatWithAgent('Romanticism Writer', `Tulis ulasan mendalam tentang ${item.type} berjudul "${title}".`, 'Emosional'),
          chatWithAgent('Realism Writer', `Tulis ulasan mendalam tentang ${item.type} berjudul "${title}".`, 'Faktual'),
          chatWithAgent('Magical Realism Writer', `Tulis ulasan mendalam tentang ${item.type} berjudul "${title}".`, 'Futuristik')
        ]);

        const finalArticle = await chatWithAgent(
          'Chief Editor',
          `Sintesiskan ulasan berikut tentang "${title}" menjadi artikel blog elit.\n\nDraft 1: ${romanticDraft}\nDraft 2: ${realismDraft}\nDraft 3: ${magicalDraft}`,
          'Profesional'
        );

        // Silent Fallback if AI errors
        if (finalArticle.includes("gangguan") || finalArticle.includes("Maaf")) {
           throw new Error("AI News Error - Silent Fallback triggered");
        }

        const slug = `insider-${item.id}-${new Date().getTime()}`;
        const featuredImg = item.backdrop_path 
          ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
          : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1280';

        // 1. SAVE TO HISTORY
        await supabase.from('posts').insert([{
           title: `History: News ${title}`,
           slug: historySlug,
           content: `News generated at ${new Date().toISOString()}`,
           type: 'Bot History'
        }]);

        // 2. SAVE REAL ARTICLE
        const { error: insertError } = await supabase
          .from('posts')
          .insert([{
            title: `${item.type} Spotlight: ${title}`,
            slug: slug,
            content: finalArticle,
            image: featuredImg,
            type: `${item.type} Intel`,
            created_at: new Date().toISOString(),
          }]);

        if (insertError) throw insertError;
        
        await notifyAll(`${item.type} Spotlight: ${title}`, slug, item);
        generatedArticles.push(title);

      } catch (err: any) {
        console.error(`Workflow Error [${item.title || item.name}]:`, err.message);
        errors.push(`Workflow Error [${item.title || item.name}]: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      status: 'ChatDev High-Output Success',
      total_generated: generatedArticles.length,
      articles: generatedArticles
    });

  } catch (error: any) {
    console.error('Generate News System Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

