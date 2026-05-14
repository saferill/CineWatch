import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { chatWithAgent } from '@/services/ai';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 1. Gather Intelligence Stats
    const { count: articleCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO);

    // 2. Executive Intelligence Analysis
    console.log(`[ADMIN INTEL] Advisor is analyzing daily operations...`);
    const analysis = await chatWithAgent('Executive Intelligence Advisor', 
      `Statistik Hari Ini: ${articleCount} Artikel Terbit.\n\nTask: Berikan laporan eksekutif singkat kepada CEO. Evaluasi performa sistem dan berikan satu saran strategis untuk meningkatkan engagement hari ini.`, 
      'Professional & Strategic'
    );

    const discordWebhook = process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    const reportTitle = `💎 **EXECUTIVE INTELLIGENCE BRIEFING** [${new Date().toLocaleDateString('id-ID')}]`;
    const reportText = `
**SITUASI OPERASIONAL:**
✅ **Status**: Optimal High-Efficiency
📰 **Konten**: ${articleCount || 0} Intel Articles Published
⚡ **Sistem**: Database Synchronized
🤖 **AI Ops**: 7-Stage Pipeline Active

**ADVISORY INSIGHT:**
_"${analysis}"_
    `;

    // 3. Dispatch to Admin Channels
    if (tgToken && tgChatId) {
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: reportTitle + '\n' + reportText, parse_mode: 'Markdown' })
      }).catch(() => {});
    }

    if (discordWebhook) {
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: reportTitle,
            description: reportText.replace(/\*/g, '**'),
            color: 0x5865F2,
            footer: { text: "CineWatch Sentinel Protocol v2.0" },
            timestamp: new Date().toISOString()
          }]
        })
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, articles_today: articleCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
