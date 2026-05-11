import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent } from '@/services/ai';

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

    // 3. AI Analysis
    const list = trending.map(([q, count]) => `${q} (${count}x)`).join(', ');
    const analysis = await chatWithAgent(
      'Search Analyst',
      `Berikut adalah kata kunci yang paling banyak dicari user dalam 24 jam terakhir: ${list}. Berikan ulasan singkat (1-2 kalimat) tentang tren apa yang sedang terjadi dan apa yang harus dilakukan Admin.`,
      'Profesional & Strategis'
    );

    // 4. Dispatch to Admin
    const discordUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    const message = `🔥 **TRENDING SEARCH ALERT**\n\n` +
                    `Top Kata Kunci:\n` + 
                    trending.map(([q, count], i) => `${i+1}. **${q}** (${count} pencarian)`).join('\n') +
                    `\n\n💡 **AI Insight:**\n${analysis}`;

    if (tgToken && tgChatId) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: message.replace(/\*\*/g, ''), parse_mode: 'Markdown' })
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
