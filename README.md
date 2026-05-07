# 🎬 CineWatch — Premium Streaming Hub

![CineWatch Banner](https://images.tmdb.org/t/p/original/wwemzKWzjKYJFfCeiB57q3r4Bcm.svg)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![OneSignal](https://img.shields.io/badge/OneSignal-Push-orange?style=for-the-badge&logo=onesignal)](https://onesignal.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**CineWatch** is a state-of-the-art, immersive streaming platform designed for true cinema enthusiasts. Built with speed, security, and aesthetics in mind, it provides a seamless experience for discovering, tracking, and watching your favorite movies, TV series, and anime.

---

## ✨ Premium Features

### 🌌 Immersive Experience
- **Ambient Mode**: Dynamic blurred backgrounds that sync with the media's color palette for a truly cinematic atmosphere.
- **Glassmorphism UI**: A modern, sleek design with subtle transparency and high-end animations powered by Framer Motion.
- **Hero Autoplay**: High-definition trailers that play automatically with a brightness/contrast boost for maximum clarity.

### 🔔 Smart Notifications
- **OneSignal Integration**: Real-time push notifications to keep you updated on new releases even when the browser is closed.
- **Notification Hub**: A central place to manage all your subscribed movies and series.
- **Release Schedule**: Dedicated daily tracking for Donghua and anime releases.

### 🚀 Cutting-Edge Utility
- **Floating Mini-Player**: Continue watching your content in a draggable, resizable mini-window while navigating the site.
- **Speed Optimizer**: Real-time internet speed detection that recommends the optimal streaming quality (up to 4K).
- **PWA Ready**: Install CineWatch directly on your mobile or desktop for a native-app experience.

### 🛡️ Security & Support
- **Content Protection**: Advanced anti-mirroring (frame-busting) and right-click protection to safeguard the platform.
- **Discord Feedback Integration**: Automated reporting for broken links and general feedback sent directly to admin via webhooks.
- **User Insights**: Personalized dashboard showing your total watch time and activity history.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Context API](https://react.dev/learn/passing-data-deeply-with-context) & [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- **Icons**: [Lucide React](https://lucide.dev/) & [Tabler Icons](https://tabler-icons.io/)
- **Notifications**: [OneSignal](https://onesignal.com/)
- **Infrastructure**: [Vercel](https://vercel.com/) / [Cloudflare](https://www.cloudflare.com/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/saferill/CineWatch.git
cd CineWatch
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add the following:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_onesignal_app_id
NEXT_PUBLIC_DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the magic.

---

## 📸 Screenshots

| Home Page | Movie Details | Release Schedule |
| :---: | :---: | :---: |
| ![Home](https://via.placeholder.com/400x225?text=CineWatch+Home) | ![Details](https://via.placeholder.com/400x225?text=Ambient+Mode) | ![Schedule](https://via.placeholder.com/400x225?text=Schedule+Grid) |

---

## 🤝 Contributing

Contributions are welcome! If you have a feature request or a bug report, please open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/saferill">saferill</a>
</p>