import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const ROUTER_ENDPOINT = 'http://localhost:20128/v1/chat/completions';
const ROUTER_API_KEY = 'sk-3b8bb76c31c5d9f6-ou98nq-8db2a0be';

async function fetchTMDB(endpoint: string) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}&api_key=${TMDB_API_KEY}`);
  return res.json();
}

// Notification Helper
async function notifyAll(title: string, slug: string) {
  const url = `https://cinewatch.vercel.app/blog/${slug}`;
  const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;

  // 1. Telegram
  if (tgToken && tgChatId) {
    const tgText = `📰 *ARTIKEL ELIT BARU!* \n\n🔥 *${title}* \n\n🚀 Ditulis oleh CineWatch ChatDev Team. \n🔗 [Baca Selengkapnya](${url})`;
    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tgChatId, text: tgText, parse_mode: 'Markdown' })
    }).catch(() => {});
  }

  // 2. Discord
  if (discordUrl) {
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
    }).catch(() => {});
  }
}

// ChatDev Inspired Multi-Agent Agent Call
async function chatDevAgent(role: string, prompt: string, style?: string) {
  const res = await fetch(ROUTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gemini/gemini-3.1-flash-lite-preview',
      messages: [
        { 
          role: 'system', 
          content: `You are a professional member of the CineWatch ChatDev Editorial Team. Role: ${role}. Style Strategy: ${style || 'Professional and Cinematic'}. Always write in Bahasa Indonesia.` 
        },
        { role: 'user', content: prompt }
      ],
      stream: false,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function GET() {
  const generatedArticles = [];
  const errors = [];
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  try {
    // 1. DATA GATHERING (Scout Agent)
    const [moviesData, tvData, animeData, donghuaData] = await Promise.all([
      fetchTMDB('/trending/movie/day?language=id-ID'),
      fetchTMDB('/trending/tv/day?language=id-ID'),
      fetchTMDB('/discover/tv?with_genres=16&sort_by=popularity.desc&language=id-ID'),
      fetchTMDB('/discover/tv?with_origin_country=CN&sort_by=popularity.desc&language=id-ID'),
    ]);

    // Create 10 Individual Tasks
    const items = [
      ...(moviesData.results?.slice(0, 3) || []).map((i: any) => ({ ...i, type: 'Movie' })),
      ...(tvData.results?.slice(0, 3) || []).map((i: any) => ({ ...i, type: 'Series' })),
      ...(animeData.results?.slice(0, 2) || []).map((i: any) => ({ ...i, type: 'Anime' })),
      ...(donghuaData.results?.slice(0, 2) || []).map((i: any) => ({ ...i, type: 'Donghua' })),
    ];

    for (const item of items) {
      try {
        const title = item.title || item.name;
        const overview = item.overview || 'Trending content on CineWatch.';
        console.log(`🎬 ChatDev Deep-Dive: ${title} (${item.type})`);

        // PHASE 1: Parallel Drafting (Romanticism vs Realism vs Magical Realism)
        const [romanticDraft, realismDraft, magicalDraft] = await Promise.all([
          chatDevAgent(
            'Romanticism Writer', 
            `Tulis ulasan mendalam tentang ${item.type} berjudul "${title}". Fokus pada sisi emosional, sinematografi, dan keindahan ceritanya.`,
            'Emosional, puitis, dan menyentuh.'
          ),
          chatDevAgent(
            'Realism Writer', 
            `Tulis ulasan mendalam tentang ${item.type} berjudul "${title}". Fokus pada fakta produksi, performa aktor, dan ulasan kritikus.`,
            'Objektif, tajam, dan informatif.'
          ),
          chatDevAgent(
            'Magical Realism Writer', 
            `Tulis ulasan mendalam tentang ${item.type} berjudul "${title}". Hubungkan dengan tema teknologi masa depan atau keajaiban sinematik.`,
            'Futuristik dan penuh imajinasi.'
          )
        ]);

        // PHASE 2: Synthesis (The Chief Editor)
        const finalArticle = await chatDevAgent(
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

        if (insertError) throw insertError;
        
        // Trigger Notifications
        await notifyAll(`${item.type} Spotlight: ${title}`, slug);
        
        generatedArticles.push(title);

      } catch (err: any) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
