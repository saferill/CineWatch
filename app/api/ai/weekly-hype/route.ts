import { NextResponse } from 'next/server';

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
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(today.getDate() + 14);

    const dateStart = nextWeek.toISOString().split('T')[0];
    const dateEnd = inTwoWeeks.toISOString().split('T')[0];

    // Fetch movies releasing in the next 7-14 days
    const data = await fetchTMDB(`/discover/movie?primary_release_date.gte=${dateStart}&primary_release_date.lte=${dateEnd}&sort_by=popularity.desc&language=id-ID`);
    const upcoming = data.results?.slice(0, 5) || [];

    if (upcoming.length === 0) {
      return NextResponse.json({ success: true, message: 'No major releases found for next week' });
    }

    const discordUrl = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL || process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app';

    const title = "🗓️ **CINEWATCH WEEKLY HYPEx CALENDAR**";
    let tgMessage = `🗓️ <b>CINEWATCH WEEKLY HYPEx CALENDAR</b>\n\n`;
    tgMessage += `<i>Bersiaplah! Ini adalah film-film besar yang akan segera hadir di CineWatch minggu depan:</i>\n\n`;
    
    let discordDescription = `Bersiaplah! Ini adalah film-film besar yang akan segera hadir di CineWatch minggu depan:\n\n`;

    upcoming.forEach((m: any, i: number) => {
      const movieUrl = `${siteUrl}/movie/${m.id}`;
      const dateStr = new Date(m.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
      
      tgMessage += `${i+1}. 🎬 <b><a href="${movieUrl}">${m.title}</a></b>\n`;
      tgMessage += `   📅 Rilis: ${dateStr}\n\n`;
      
      discordDescription += `${i+1}. 🎬 **[${m.title}](${movieUrl})**\n`;
      discordDescription += `   📅 Rilis: ${dateStr}\n\n`;
    });

    tgMessage += `🚀 <b>Pantau terus CineWatch untuk update terbaru!</b>`;

    // Dispatch to Telegram
    if (tgToken && tgChatId) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: tgChatId, 
          text: tgMessage, 
          parse_mode: 'HTML',
          disable_web_page_preview: false
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
            title: "🗓️ CINEWATCH WEEKLY HYPEx CALENDAR",
            description: discordDescription,
            color: 0xFACC15, // Yellow/Amber
            image: upcoming[0].backdrop_path ? { url: `https://image.tmdb.org/t/p/w1280${upcoming[0].backdrop_path}` } : undefined,
            footer: { text: "CineWatch Future Intelligence" },
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(e => console.error('Weekly Hype Discord Error:', e));
    }

    return NextResponse.json({ success: true, count: upcoming.length });
  } catch (error: any) {
    console.error('Weekly Hype System Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

