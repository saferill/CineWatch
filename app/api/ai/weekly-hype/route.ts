import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

  try {
    const today = new Date();
    // Get week number to prevent duplication
    const weekNumber = Math.ceil(today.getDate() / 7);
    const month = today.getMonth() + 1;
    const yearNum = today.getFullYear();
    const historySlug = `weekly-hype-${yearNum}-${month}-${weekNumber}`;

    // ANTI-DUPLICATE CHECK
    const { data: existing } = await supabase.from('posts').select('id').eq('slug', historySlug).single();
    if (existing) {
      return NextResponse.json({ success: true, message: 'Weekly Hype already sent for this week' });
    }

    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(today.getDate() + 14);

    const dateStart = nextWeek.toISOString().split('T')[0];
    const dateEnd = inTwoWeeks.toISOString().split('T')[0];

    const data = await fetchTMDB(`/discover/movie?primary_release_date.gte=${dateStart}&primary_release_date.lte=${dateEnd}&sort_by=popularity.desc&language=id-ID`);
    const upcoming = data.results?.slice(0, 5) || [];

    if (upcoming.length === 0) {
      return NextResponse.json({ success: true, message: 'No major releases found for next week' });
    }

    const discordUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatchh.vercel.app';

    let tgMessage = `🗓️ <b>CINEWATCH WEEKLY HYPEx</b>\n` +
                    `━━━━━━━━━━━━━━━━━━\n\n` +
                    `<i>Film-film besar yang akan segera hadir di CineWatch minggu depan:</i>\n\n`;
    
    let discordDescription = `### 🗓️ CINEWATCH WEEKLY HYPEx\n*Film-film besar yang akan segera hadir minggu depan:*\n\n`;

    upcoming.forEach((m: any, i: number) => {
      const movieUrl = `${siteUrl}/movie/${m.id}/watch`;
      const dateStr = new Date(m.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
      const rating = m.vote_average ? `⭐ ${m.vote_average.toFixed(1)}` : '⭐ TBD';
      
      tgMessage += `${i+1}. 🎬 <b><a href="${movieUrl}">${m.title.toUpperCase()}</a></b>\n` +
                    `   📅 <b>Rilis:</b> ${dateStr}\n` +
                    `   🌟 <b>Hype:</b> ${rating}\n\n`;
      
      discordDescription += `${i+1}. 🎬 **[${m.title}](${movieUrl})**\n` +
                            `   📅 **Rilis:** ${dateStr} | 🌟 **Hype:** ${rating}\n\n`;
    });

    tgMessage += `━━━━━━━━━━━━━━━━━━\n` +
                  `🚀 <b>Pantau terus CineWatch untuk update terbaru!</b>`;

    // Dispatch to Telegram
    if (tgToken && tgChatId) {
      const poster = `https://image.tmdb.org/p/w780${upcoming[0].backdrop_path || upcoming[0].poster_path}`;
      await fetch(`https://api.telegram.org/bot${tgToken}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: tgChatId, 
          photo: poster,
          caption: tgMessage, 
          parse_mode: 'HTML'
        })
      }).catch(e => console.error('Weekly Hype TG Error:', e));
    }

    // Dispatch to Discord
    if (discordUrl) {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "🗓️ WEEKLY HYPEx CALENDAR",
            description: discordDescription,
            color: 0xFACC15,
            image: upcoming[0].backdrop_path ? { url: `https://image.tmdb.org/t/p/w1280${upcoming[0].backdrop_path}` } : undefined,
            footer: { text: "CineWatch Future Intelligence" },
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(e => console.error('Weekly Hype Discord Error:', e));
    }

    // SAVE TO HISTORY
    await supabase.from('posts').insert([{
      title: `Weekly Hype: ${month}/${yearNum}`,
      slug: historySlug,
      content: `Weekly calendar sent at ${new Date().toISOString()}`,
      type: 'Bot History'
    }]);

    return NextResponse.json({ success: true, count: upcoming.length });
  } catch (error: any) {
    console.error('Weekly Hype System Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

