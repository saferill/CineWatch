<div align="center">
  
  <br />
  <br />

  <h1>🎬 CineWatch</h1>
  
  <p>
    <strong>A Premium Streaming Platform for Movies, TV Shows, and Anime</strong>
  </p>

  <p>
    <a href="https://github.com/saferill/CineWatch/stargazers"><img src="https://img.shields.io/github/stars/saferill/CineWatch?style=for-the-badge&color=06B6D4" alt="Stars" /></a>
    <a href="https://github.com/saferill/CineWatch/network/members"><img src="https://img.shields.io/github/forks/saferill/CineWatch?style=for-the-badge&color=3B82F6" alt="Forks" /></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
  </p>
</div>

<hr />

## 🌟 Introduction

**CineWatch** is a beautifully crafted, modern streaming platform built to provide an unparalleled viewing experience. Designed with a premium, sleek user interface, it allows users to effortlessly discover, track, and watch their favorite movies, television series, and anime.

With lightning-fast performance powered by Next.js 16 (App Router), cinematic animations via Framer Motion, and seamless API integrations, CineWatch delivers a distraction-free entertainment hub right to your screen.

## ✨ Key Features

- **🎥 Unlimited Streaming** — Watch movies, TV series, and anime instantly using multiple high-quality streaming providers.
- **⚡ Smart Search Engine** — Find exactly what you're looking for with our debounced, lightning-fast search functionality covering titles, actors, and genres.
- **🎨 Premium UI/UX** — Enjoy a responsive, dark-mode optimized interface with glassmorphism effects, cinematic carousels, and smooth micro-animations.
- **📺 Dedicated Anime Section** — Comprehensive anime catalog integrated with Anilist, featuring multi-language dub support (Sub, Dub, Hindi).
- **📚 Watch History & Tracking** — Keep track of what you've watched, manage your watchlist, and pick up right where you left off.
- **📱 Responsive Design** — A flawless experience across desktop, tablet, and mobile devices.

## 🛠️ Tech Stack

CineWatch leverages modern web technologies for maximum performance and developer experience:

- **Framework:** [Next.js 16](https://nextjs.org/) (React)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **State Management:** [React Query](https://tanstack.com/query)
- **Data Sources:** 
  - [TMDB API](https://www.themoviedb.org/api) (Movies & TV Shows)
  - [Anilist API](https://anilist.co/api/v2/) (Anime Metadata)
- **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these steps to set up CineWatch locally on your machine.

### Prerequisites
- Node.js 18.17 or later
- pnpm (recommended package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saferill/CineWatch.git
   cd CineWatch
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Rename `.env.example` to `.env.local` or create a new `.env.local` file in the root directory:
   ```env
   # TMDB Configuration (Required)
   TMDB_API_KEY=your_tmdb_api_key_here
   
   # Optional configurations (Fallbacks exist in code)
   NEXT_PUBLIC_TMDB_BASEURL=https://api.themoviedb.org/3/
   ```
   > 💡 *You can get a free TMDB API key by creating an account at [TheMovieDB](https://www.themoviedb.org/settings/api).*

4. **Run the development server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  <i>Coded with ❤️ by saferill.</i>
</div>