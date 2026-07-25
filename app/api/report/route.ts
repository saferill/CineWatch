import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { mediaTitle, mediaId, mediaType, episode, reason, userAgent, url, serverName } = await req.json()

    const discordWebhook = process.env.DISCORD_RELEASE_WEBHOOK_URL
    const tgToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
    const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID

    const timestamp = new Date().toLocaleString('id-ID')

    // 1. Send to Discord
    if (discordWebhook) {
      await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: "🚨 LAPORAN LINK MATI / ERROR",
            color: 0xFF0000,
            fields: [
              { name: "Judul Konten", value: mediaTitle || "Unknown", inline: true },
              { name: "Type", value: mediaType || "Unknown", inline: true },
              { name: "Server", value: serverName || "Unknown", inline: true },
              { name: "Episode", value: episode || "N/A", inline: true },
              { name: "Masalah", value: reason || "Link Mati", inline: false },
              { name: "Halaman URL", value: url || "Unknown", inline: false },
              { name: "Waktu", value: timestamp, inline: true }
            ],
            footer: { text: "CineWatch Sentinel System" }
          }]
        })
      })
    }

    // 2. Send to Telegram
    if (tgToken && tgChatId) {
      const message = `🚨 *LAPORAN ERROR CINEWATCH*\n\n🎬 *Judul:* ${mediaTitle}\n📂 *Server:* ${serverName || 'Unknown'}\n📂 *Tipe:* ${mediaType}\n🎞️ *Ep:* ${episode || 'N/A'}\n⚠️ *Masalah:* ${reason}\n\n🔗 [Cek Link](${url})\n📅 *Waktu:* ${timestamp}`
      await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: message, parse_mode: 'Markdown' })
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
