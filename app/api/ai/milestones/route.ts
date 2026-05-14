import { NextResponse } from 'next/server';
import { getPlatformMilestones, chatWithAgent } from '@/services/ai';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const stats = await getPlatformMilestones();

    // Determine if we reached a milestone (e.g. multiples of 100, 1000, etc.)
    // For demo purposes, we'll just send if numbers are significant
    if (stats.users < 1 && stats.posts < 1) {
      return NextResponse.json({ success: true, message: 'Not enough data for milestones' });
    }

    const discordUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHANNEL_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    const celebrationMsg = await chatWithAgent(
      'Community Engagement Manager',
      `Platform Update: ${stats.users} Users, ${stats.posts} Articles, ${stats.searches} Searches.\n\nTask: Buat pesan perayaan korporat yang elegan dan apresiatif. Fokus pada "Terima Kasih kepada Komunitas" dan "Visi Masa Depan CineWatch".`,
      'Appreciative & Professional'
    );

    const message = `🎉 **CINEWATCH MILESTONE REACHED!** 🎉\n\n` +
                    `📊 **Stats Saat Ini:**\n` +
                    `👤 Users: ${stats.users}\n` +
                    `✍️ Articles: ${stats.posts}\n` +
                    `🔍 Total Searches: ${stats.searches}\n\n` +
                    `${celebrationMsg}`;

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
            title: "🎉 CINEWATCH MILESTONE REACHED!",
            description: message,
            color: 0x00FF00,
            footer: { text: "CineWatch Growth Sentinel" }
          }]
        })
      });
    }

    return NextResponse.json({ success: true, stats });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
