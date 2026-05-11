import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent } from '@/services/ai';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function fetchTMDB(endpoint: string) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`);
  return res.json();
}

// Notification Helper
async function notifyAll(title: string, slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app';
  const url = `${siteUrl}/blog/${slug}`;
  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.DISCORD_RELEASE_WEBHOOK_URL;

  // 1. Telegram
  if (tgToken && tgChatId) {
    const tgText = `📰 *ARTIKEL ELIT BARU!* \n\n🔥 *${title}* \n\n🚀 Ditulis oleh CineWatch ChatDev Team. \n🔗 [Baca Selengkapnya](${url})`;
    try {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: tgText, parse_mode: 'Markdown' })
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
            title: "📰 CineWatch Insider: New Article Published",
            description: `🔥 **${title}**\n\nSebuah mahakarya kolaborasi multi-agen ChatDev baru saja diterbitkan.`,
            url: url,
            color: 0x00BFFF,
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
    
    // 1. DATA GATHERING (Scout Agent)
    const [moviesData, tvData, animeData, donghuaData] = await Promise.all([
      fetchTMDB('/trending/movie/day?language=id-ID'),
      fetchTMDB('/trending/tv/day?language=id-ID'),
      fetchTMDB('/discover/tv?with_genres=16&sort_by=popularity.desc&language=id-ID'),
      fetchTMDB('/discover/tv?with_origin_country=CN&sort_by=popularity.desc&language=id-ID'),
    ]);

    // Create Individual Tasks
    const items = [
      ...(moviesData.results?.slice(0, 2) || []).map((i: any) => ({ ...i, type: 'Movie' })),
      ...(tvData.results?.slice(0, 2) || []).map((i: any) => ({ ...i, type: 'Series' })),
      ...(animeData.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Anime' })),
      ...(donghuaData.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Donghua' })),
    ];

    if (items.length === 0) {
      return NextResponse.json({ success: true, message: 'No items to process' });
    }

    for (const item of items) {
      try {
        const title = item.title || item.name;
        const overview = item.overview || 'Trending content on CineWatch.';
        console.log(`🎬 ChatDev Deep-Dive: ${title} (${item.type})`);

        // PHASE 1: Parallel Drafting
        const [romanticDraft, realismDraft, magicalDraft] = await Promise.all([
          chatWithAgent(
            'Romanticism Writer', 
            `Tulis ulasan mendalam tentang ${item.type} berjudul "${title}". Fokus pada sisi emosional, sinematografi, dan keindahan ceritanya.`,
            'Emosional, puitis, dan menyentuh.'
          ),
          chatWithAgent(
            'Realism Writer', 
            `Tulis ulasan mendalam tentang ${item.type} berjudul "${title}". Fokus pada fakta produksi, performa aktor, dan ulasan kritikus.`,
            'Objektif, tajam, dan informatif.'
          ),
          chatWithAgent(
            'Magical Realism Writer', 
            `Tulis ulasan mendalam tentang ${item.type} berjudul "${title}". Hubungkan dengan tema teknologi masa depan atau keajaiban sinematik.`,
            'Futuristik dan penuh imajinasi.'
          )
        ]);

        // PHASE 2: Synthesis
        const finalArticle = await chatWithAgent(
          'Chief Editor',
          `Sintesiskan tiga ulasan berikut tentang "${title}" menjadi satu artikel blog elit yang kohesif.
          
          Draft 1: ${romanticDraft}
          Draft 2: ${realismDraft}
          Draft 3: ${magicalDraft}
          
          Gunakan Markdown, buat subjudul yang menarik, dan berikan kesimpulan akhir.`,
          'Elegan, Profesional, dan Berwibawa.'
        );

        // Save to Supabase
        const slug = `insider-${item.id}-${new Date().getTime()}`;
        const featuredImg = item.backdrop_path 
          ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
          : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1280';

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

        if (insertError) {
          console.error('Supabase Insert Error:', insertError);
          throw insertError;
        }
        
        // Trigger Notifications
        await notifyAll(`${item.type} Spotlight: ${title}`, slug);
        
        generatedArticles.push(title);
        console.log(`✅ AI: Article generated for ${title}`);

      } catch (err: any) {
        console.error(`Workflow Error [${item.title || item.name}]:`, err.message);
        errors.push(`Workflow Error [${item.title || item.name}]: ${err.message}`);
      }
    }

    return NextResponse.json({ 
      status: 'ChatDev High-Output Mode Success',
      total_generated: generatedArticles.length,
      articles: generatedArticles,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('Generate News System Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

