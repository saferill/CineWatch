# 🎬 CineWatch: The Ultimate Cinematic Experience


<div align="center">

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![OneSignal](https://img.shields.io/badge/Push-OneSignal-orange?style=for-the-badge&logo=onesignal)](https://onesignal.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge)](https://web.dev/progressive-web-apps/)

**CineWatch** adalah platform streaming modern yang dirancang khusus untuk penggemar Film, TV Series, Anime, dan **Donghua**. Nikmati pengalaman menonton premium dengan fitur kelas dunia dan UI yang memanjakan mata.

</div>

---

## 🌟 Fitur Unggulan

### 🎨 Visual & UI Premium
*   **Ambient Background Mode**: Background yang berubah warna secara dinamis mengikuti poster film, memberikan efek *cinematic blur* yang mewah.
*   **Hero Cinema Trailers**: Trailer berkualitas tinggi yang berputar otomatis dengan peningkatan kontras dan kecerahan tanpa gangguan tombol play.
*   **Ultra-Minimalist Interface**: Desain bersih tanpa iklan yang mengganggu dan navigasi bawah yang responsif untuk pengguna mobile.

### ⛩️ Spesialisasi Donghua & Anime
*   **Jadwal Rilis Harian**: Pantau update terbaru setiap hari dari Senin sampai Minggu khusus untuk Donghua dan Anime favorit Anda.
*   **Multi-Provider Streaming**: Dukungan server streaming dari berbagai provider handal (VidSrc, VidKing, AutoEmbed, dll).

### 🔔 Notifikasi & Tracking Canggih
*   **OneSignal Push Notification**: Dapatkan pengingat rilis langsung ke layar HP Anda meskipun browser sedang ditutup.
*   **Floating Mini-Player**: Lanjut menonton sambil menjelajahi koleksi film lain dengan jendela video yang bisa digeser (Drag & Drop).
*   **Internet Speed Optimizer**: Deteksi kecepatan internet real-time dan rekomendasi kualitas video terbaik (hingga 4K).

### 📊 Dashboard & Keamanan
*   **User Watch Statistics**: Pantau berapa banyak waktu yang Anda habiskan untuk menonton dan lihat riwayat aktivitas Anda.
*   **Discord Reporting System**: Lapor link mati atau kirim feedback langsung ke admin via integrasi Discord Webhook.
*   **Advanced Content Protection**: Keamanan tingkat tinggi untuk mencegah mirroring dan pencurian aset website.

---

## 🛠️ Arsitektur Teknologi

*   **Core**: Next.js 15 (App Router), TypeScript
*   **Animations**: Framer Motion
*   **APIs**: TMDB (Movies/Series), Anilist (Anime), Moli API (Donghua)
*   **Communication**: OneSignal (Push), Discord (Webhooks)
*   **PWA**: Web App Manifest & Service Workers

---

## 🚀 Cara Instalasi

### 1. Persiapan Environment
Buat file `.env.local` di root direktori:

```env
NEXT_PUBLIC_TMDB_API_KEY=kode_api_tmdb_anda
NEXT_PUBLIC_ONESIGNAL_APP_ID=kode_app_id_onesignal
NEXT_PUBLIC_DISCORD_WEBHOOK_URL=url_webhook_discord
```

### 2. Jalankan Project
```bash
npm install
npm run dev
```

---

## 📸 Tampilan Platform

| Dashboard Utama | Player Mode | Release Schedule |
| :---: | :---: | :---: |
| ![Home](https://via.placeholder.com/400x225?text=Minimalist+Home) | ![Player](https://via.placeholder.com/400x225?text=Floating+Mini+Player) | ![Schedule](https://via.placeholder.com/400x225?text=Daily+Update+Grid) |

---

<div align="center">
  
  Dibuat dengan ❤️ untuk komunitas pecinta film oleh [saferill](https://github.com/saferill)
  
</div>
