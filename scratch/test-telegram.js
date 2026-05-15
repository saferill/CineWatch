async function testTelegram() {
  const token = "8729704311:AAHxx-sC-6ywpNMAq2iFZmFssUMxLDQBJU4";
  const animeChannelId = "-1003916777798";
  
  const message = `📡 **AUDIT SINYAL CINEWATCH** 📡\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `🏢 **Departemen:** Engineering (Anime/Donghua Unit)\n` +
                  `🚀 **Status Jalur:** MENGUJI KONEKTIVITAS...\n` +
                  `✅ **Hasil:** JALUR AKTIF & TERVERIFIKASI\n` +
                  `━━━━━━━━━━━━━━━━━━━━\n` +
                  `Boss, jika pesan ini muncul, berarti sistem pengiriman Anime & Donghua sudah bekerja 100% tanpa hambatan.`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: animeChannelId,
        text: message,
        parse_mode: 'HTML'
      })
    });
    const data = await res.json();
    if (data.ok) {
      console.log("SUCCESS: Message sent to Anime Channel!");
    } else {
      console.error("FAILED: Telegram API error:", data);
    }
  } catch (e) {
    console.error("FAILED: Could not send to Anime Channel.", e.message);
  }
}

testTelegram();
