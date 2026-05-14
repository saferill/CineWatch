import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent, searchYou } from '@/services/ai';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 1. Fetch top searches from last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data: searches, error } = await supabase
      .from('search_history')
      .select('query')
      .gte('created_at', yesterday.toISOString());

    if (error) throw error;
    if (!searches || searches.length === 0) {
      return NextResponse.json({ success: true, message: 'No searches yet' });
    }

    // 2. Count frequencies
    const counts: any = {};
    searches.forEach(s => {
      counts[s.query] = (counts[s.query] || 0) + 1;
    });

    const trending = Object.entries(counts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5);

    if (trending.length === 0) return NextResponse.json({ success: true });

    // 3. STAGE 1: Market Data Analysis
    const list = trending.map(([q, count]) => `${q} (${count}x)`).join(', ');
    const topQuery = trending[0][0];
    
    console.log(`[DATA SCIENTIST] Analyzing psychological triggers for: ${topQuery}...`);
    const trendContext = await researchYou(`Analyze why "${topQuery}" is trending in May 2026. What are the psychological triggers, release statuses, or news events behind this?`);
    
    // STAGE 2: Strategic Insight Generation
    let analysis = "";
    try {
      analysis = await chatWithAgent(
        'Market Data Scientist',
        `User Activity Data: ${list}.\n\nDeep Context: ${trendContext}\n\nTask: Jelaskan tren psikologi penonton saat ini dan berikan saran strategis untuk Admin (misal: "Segera rilis konten X" atau "User sedang mencari link Y"). Gunakan bahasa bisnis yang tajam dan elit.`,
        'Strategic & Analytical'
      );
      if (analysis.includes("gangguan") || analysis.includes("Maaf")) throw new Error("AI Error");
    } catch (e) {
      analysis = `Permintaan pencarian didominasi oleh "${topQuery}". Admin disarankan untuk memperbarui metadata dan ketersediaan link pada judul tersebut guna mempertahankan retensi user.`;
    }

    // 4. Dispatch to Admin
    const discordUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    const message = `🔥 <b>TRENDING SEARCH ALERT</b>\n\n` +
                    `Top Kata Kunci:\n` + 
                    trending.map(([q, count], i) => `${i+1}. <b>${q}</b> (${count} pencarian)`).join('\n') +
                    `\n\n💡 <b>AI Insight:</b>\n<i>${analysis}</i>`;

    if (tgToken && tgChatId) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: message, parse_mode: 'HTML' })
      });
    }

    if (discordUrl) {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "🔥 TRENDING SEARCH ALERT",
            description: message,
            color: 0xFF8C00,
            footer: { text: "CineWatch Search Intelligence" }
          }]
        })
      });
    }

    return NextResponse.json({ success: true, trending });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
