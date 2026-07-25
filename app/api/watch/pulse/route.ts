import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function POST(req: Request) {
  try {
    const { title, type, season, episode } = await req.json();
    const discordUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL;
    const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    const emoji = type === 'movie' ? '🎬' : type === 'anime' ? '🎌' : '📺';
    const detail = type === 'movie' ? '' : ` (Season ${season}, Episode ${episode})`;
    const message = `${emoji} *Seseorang sedang menonton:* **${title}**${detail}\n🚀 Mari bergabung di CineWatch!`;

    // Notify Discord
    if (discordUrl) {
      await fetch(discordUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            description: message.replace(/\*/g, '**'),
            color: 0x3498DB,
            footer: { text: "CineWatch Live Pulse" },
            timestamp: new Date().toISOString()
          }]
        })
      });
    }

    // Notify Telegram (Optional: keep it low noise, or only for admin)
    // if (tgToken && tgChatId) { ... }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
