import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent, researchYou, sendInternalLog } from '@/services/ai';

const TMDB_API_KEY = process.env.TMDB_API_KEY;

async function fetchTMDB(endpoint: string) {
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`);
  return res.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const mainChannelId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
  const animeChannelId = process.env.TELEGRAM_ANIME_CHANNEL_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

  try {
    const today = new Date();
    const weekNumber = Math.ceil(today.getDate() / 7);
    const month = today.getMonth() + 1;
    const yearNum = today.getFullYear();

    const processHype = async (type: string, targetChannel: string | undefined, label: string) => {
      if (!targetChannel) return;
      
      const historySlug = `weekly-v2-${type}-${yearNum}-${month}-${weekNumber}`;
      const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
      if (existing) return;

      const dateStart = new Date();
      dateStart.setDate(today.getDate() + 1);
      const dateEnd = new Date();
      dateEnd.setDate(today.getDate() + 14);

      let endpoint = "";
      if (type === 'main') {
        endpoint = `/discover/movie?primary_release_date.gte=${dateStart.toISOString().split('T')[0]}&primary_release_date.lte=${dateEnd.toISOString().split('T')[0]}&sort_by=popularity.desc&language=id-ID`;
      } else {
        endpoint = `/discover/tv?with_genres=16&first_air_date.gte=${dateStart.toISOString().split('T')[0]}&first_air_date.lte=${dateEnd.toISOString().split('T')[0]}&sort_by=popularity.desc&language=id-ID`;
      }

      const res = await fetch(`https://api.themoviedb.org/3${endpoint}&api_key=${process.env.TMDB_API_KEY}`);
      const data = await res.json();
      const upcoming = data.results?.slice(0, 5) || [];

      if (upcoming.length > 0) {
        console.log(`[GROWTH FORECASTER] Analyzing market impact for upcoming ${label}...`);
        
        const list = upcoming.map((m: any) => `- ${m.title || m.name} (${m.release_date || m.first_air_date})`).join('\n');
        
        // STAGE 1: Market Intelligence
        const marketIntel = await researchYou(`Anticipation and hype analysis for upcoming ${label} releases: ${list}. Which ones are likely to break the internet in 2026?`);

        // STAGE 2: Forecast Generation
        const forecast = await chatWithAgent('Strategic Growth Forecaster', 
          `Upcoming Releases:\n${list}\n\nMarket Intelligence: ${marketIntel}\n\nTask: Berikan satu paragraf analisis pertumbuhan tentang kenapa rilis-rilis ini akan mendominasi pasar dan bagaimana user harus bersiap. Gunakan bahasa bisnis yang visioner.`, 
          'Visionary & Analytical'
        );

        let tgMessage = `🗓️ <b>CINEWATCH ${label.toUpperCase()} CALENDAR</b>\n` +
                        `━━━━━━━━━━━━━━━━━━━━\n\n` +
                        `💡 <b>STRATEGIC FORECAST:</b>\n` +
                        `<i>"${forecast}"</i>\n\n` +
                        `🔥 <b>TOP UPCOMING RELEASES:</b>\n\n`;

        upcoming.forEach((m: any, i: number) => {
          const watchUrl = `${siteUrl}/${m.title ? 'movie' : 'series'}/${m.id}/watch`;
          const dateStr = new Date(m.release_date || m.first_air_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
          tgMessage += `${i+1}. 🔥 <b><a href="${watchUrl}">${(m.title || m.name).toUpperCase()}</a></b>\n` +
                        `   📅 <b>Rilis:</b> ${dateStr}\n\n`;
        });

        tgMessage += `━━━━━━━━━━━━━━━━━━━━\n` +
                      `🚀 <b>Pantau terus CineWatch untuk update terbaru!</b>`;

        const poster = `https://image.tmdb.org/t/p/w780${upcoming[0].backdrop_path || upcoming[0].poster_path}`;
        await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: targetChannel, photo: poster, caption: tgMessage, parse_mode: 'HTML' })
        });

        await supabase.from('posts').insert([{ title: `Weekly Hype: ${label}`, slug: historySlug, type: 'Bot History' }]);
      }
    };

    await Promise.all([
      processHype('main', mainChannelId, 'Movie/Series'),
      processHype('anime', animeChannelId, 'Anime/Donghua')
    ]);

    // STAGE 3: Corporate Vision Setting
    console.log(`[BOARDROOM] CEO & Forecaster setting Weekly Vision...`);
    const vision = await chatWithAgent('CineWatch CEO', 
      `Berdasarkan tren rilis minggu ini, tentukan satu "Misi Besar" perusahaan kita untuk 7 hari ke depan. Fokus pada dominasi pasar dan kualitas brand.`, 
      'Visionary & Strategic'
    );

    await supabase.from('posts').insert([{
      title: `Weekly Vision: ${new Date().toLocaleDateString()}`,
      content: vision,
      slug: `vision-${Date.now()}`,
      type: 'Bot History'
    }]);

    await sendInternalLog('CEO', `Visi Mingguan Telah Ditetapkan: "${vision}"\n\nSeluruh departemen diperintahkan untuk menyesuaikan strategi mereka!`);

    return NextResponse.json({ success: true, vision });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

