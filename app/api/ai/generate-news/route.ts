import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent, searchYou, researchYou } from '@/services/ai';

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
    const { searchParams: queryParams } = new URL(request.url);
    const categoryFilter = queryParams.get('category'); // movie, series, anime, donghua

    const mainChannelId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    const fetchPromises = [];
    if (!categoryFilter || categoryFilter === 'movie') fetchPromises.push(fetchTMDB('/trending/movie/day?language=id-ID').then(d => (d.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Movie' }))));
    if (!categoryFilter || categoryFilter === 'series') fetchPromises.push(fetchTMDB('/trending/tv/day?language=id-ID').then(d => (d.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Series' }))));
    if (!categoryFilter || categoryFilter === 'anime') fetchPromises.push(fetchTMDB('/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc&language=id-ID').then(d => (d.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Anime' }))));
    if (!categoryFilter || categoryFilter === 'donghua') fetchPromises.push(fetchTMDB('/discover/tv?with_genres=16&with_origin_country=CN&sort_by=popularity.desc&language=id-ID').then(d => (d.results?.slice(0, 1) || []).map((i: any) => ({ ...i, type: 'Donghua' }))));

    const resultsArray = await Promise.all(fetchPromises);
    const options = resultsArray.flat().slice(0, 3); // Ambil 3 opsi terbaik

    if (options.length === 0) return NextResponse.json({ success: true, message: 'No options found' });

    // STAGE 0: THE STRATEGIC BOARD MEETING
    console.log(`[BOARDROOM] CEO has called for a meeting...`);
    const optionsList = options.map((o: any, i: number) => `${i+1}. ${o.title || o.name} (${o.type})`).join('\n');
    
    await sendInternalLog('CEO', `Rapat Pagi Dimulai. Kita punya 3 opsi berita hari ini:\n${optionsList}\n\nTim, berikan analisis kalian!`);

    // Discussion Step
    const boardDiscussion = await chatWithAgent('CEO', 
      `Opsi Berita:\n${optionsList}\n\nTask: Berperanlah sebagai CEO yang sedang berdiskusi dengan Head of Intelligence dan SEO Engineer. Tentukan SATU berita yang paling layak tayang hari ini berdasarkan potensi kemewahan dan viralitas. Berikan alasan singkat.`, 
      'Authoritative & Decisive'
    );

    await sendInternalLog('CEO', `Keputusan Final Rapat: ${boardDiscussion}\n\nTim Redaksi, segera eksekusi!`);

    // Ambil topik terpilih (paling simpel kita biarkan AI memilih satu dari 3, atau kita pilih yang pertama tapi dengan narasi rapat)
    const selectedItem = options[0]; // Untuk stabilitas kode, kita tetap ambil satu tapi dengan konteks rapat.
    const items = [selectedItem];

    for (const item of items) {
      const targetChannel = mainChannelId;

      // STABLE SLUG: Unique forever for this movie/show
      const historySlug = `v4-intel-forever-${item.id}`;

      const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
      if (existing) {
        console.log(`AI: Skipping ${item.title || item.name} (Already covered before)`);
        continue;
      }

      const title = item.title || item.name;
      
      // STAGE 1: Intelligence Lead (The Data Hunter)
      console.log(`[NEWSROOM] STAGE 1: Head of Intelligence gathering data for ${title}...`);
      const rawIntel = await researchYou(`Corporate Briefing for "${title}" (2026). Focus on: Production secrets, industry power moves, and unique data points that competitors don't have.`);
      
      // STAGE 2: CEO Strategic Vision
      console.log(`[NEWSROOM] STAGE 2: CEO Setting the Luxury Vision...`);
      const ceoVision = await chatWithAgent('CineWatch CEO', `Data: ${rawIntel}\n\nBoss, tentukan arah artikel ini. Kita ingin ini terasa "Sangat Mewah" dan "Eksklusif". Apa pesan utama yang harus kita sampaikan ke publik?`, 'Demanding & Visionary');

      // STAGE 3: Narrative Specialists (Creative Team)
      console.log(`[NEWSROOM] STAGE 3: Specialist Writers creating drafts...`);
      const [draftA, draftB, draftC] = await Promise.all([
        chatWithAgent('Senior Cinema Historian', `Write about artistic legacy for "${title}". Strategy: ${ceoVision}`, 'Artistic & Wise'),
        chatWithAgent('Industry Market Analyst', `Write about market disruption for "${title}". Strategy: ${ceoVision}`, 'Sharp & Objective'),
        chatWithAgent('Futuristic Trendscout', `Write about the future of cinema regarding "${title}". Strategy: ${ceoVision}`, 'Bold & Imaginative')
      ]);

      // STAGE 4: Editor-in-Chief (Synthesis)
      console.log(`[NEWSROOM] STAGE 4: Editor-in-Chief synthesizing Master Piece...`);
      const synthesizedWork = await chatWithAgent('Editor-in-Chief', `Merge ini draf dari tim kreatif untuk "${title}". Pastikan alurnya sempurna dan memenuhi standar High-Authority kita.\n\nDrafts:\n1: ${draftA}\n2: ${draftB}\n3: ${draftC}`, 'Perfectionist & Authoritative');
      
      // STAGE 5: Luxury Tone Specialist (Brand Guard)
      console.log(`[NEWSROOM] STAGE 5: Luxury Brand Specialist polishing tone...`);
      const luxuryArticle = await chatWithAgent('Luxury Brand Manager', `Refine this article: ${synthesizedWork}\n\nTask: Elevate language to "Ultra-Elite" level. Use High-Class Indonesian.`, 'Elite & Elegant');

      // STAGE 6: Legal & Compliance Officer
      console.log(`[NEWSROOM] STAGE 6: Legal Review...`);
      const legalReview = await chatWithAgent('Legal Officer', `Review this content: ${luxuryArticle}\n\nTask: Pastikan tidak ada pelanggaran hak cipta, SARA, atau konten dewasa. Berikan saran perbaikan jika ada.`, 'Formal & Strict');

      // STAGE 7: The QA "Ruthless" Critic
      console.log(`[NEWSROOM] STAGE 7: Ruthless Quality Audit...`);
      const qaFeedback = await chatWithAgent('QA Ruthless Critic', `Draf: ${luxuryArticle}\n\nReview Legal: ${legalReview}\n\nTask: Cari 3 kelemahan dari draf ini dan berikan kritik pedas untuk memperbaikinya. Jangan kasih ampun.`, 'Sarcastic & Perfectionist');

      // STAGE 8: Viral Growth Strategist
      console.log(`[NEWSROOM] STAGE 8: Viral Strategy...`);
      const viralStrategy = await chatWithAgent('Viral Growth Strategist', `Artikel: ${luxuryArticle}\n\nTask: Buat 3 caption viral untuk TikTok, Instagram, dan X berdasarkan artikel ini. Gunakan gaya Luxury-GenZ yang menggoda.`, 'Energetic & Trendy');

      // STAGE 9: SEO & Digital Engineer
      console.log(`[NEWSROOM] STAGE 9: SEO Optimization...`);
      const seoArticle = await chatWithAgent('SEO & Growth Engineer', `Optimize: ${luxuryArticle}\n\nFeedback QA: ${qaFeedback}\n\nTask: Optimasi tanpa merusak gaya mewah.`, 'Technical & Precise');

      // STAGE 10: CEO Final Audit (The Boss)
      console.log(`[NEWSROOM] STAGE 10: CEO Final Audit...`);
      let finalArticle = await chatWithAgent('CEO (Final Review)', `Final Draft untuk "${title}":\n\nContent: ${seoArticle}\n\nQA Critique: ${qaFeedback}\n\nLegal: ${legalReview}\n\nSocial Strategy: ${viralStrategy}\n\nBoss, berikan artikel final yang sempurna untuk publish.`, 'Strict & Masterful');

      // STAGE 11: AUTONOMOUS SELF-CORRECTION (The Final Polish)
      if (finalArticle.length < 500) {
        console.log(`[NEWSROOM] STAGE 11: Self-Correction triggered (Article too short)...`);
        finalArticle = await chatWithAgent('Editor-in-Chief', `Artikel ini ditolak karena terlalu pendek. Perluas pembahasannya secara mendalam agar berwibawa: ${finalArticle}`, 'Authoritative');
      }

      if (finalArticle.includes("gangguan") || finalArticle.includes("Maaf")) {
         finalArticle = luxuryArticle || synthesizedWork || rawIntel || item.overview || "Intelijen sinematik eksklusif dari CineWatch.";
      }

      // Freshness Protocol: Content Rotation
      console.log(`[NEWSROOM] Freshness Protocol: Rotating old articles...`);
      await supabase.from('posts').delete().in('type', ['Movie Intel', 'Series Intel', 'Anime Intel', 'Donghua Intel']);

      const slug = `insider-${item.id}-${new Date().getTime()}`;
      // Record history to never repeat
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

