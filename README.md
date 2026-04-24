# CineWatch

A modern streaming platform for movies, TV shows, and anime built with Next.js 16, Tailwind CSS, and TypeScript.

## Features

- **Movies** - Browse trending, popular, and top-rated movies from TMDB
- **TV Shows** - Stream TV series with episode support
- **Anime** - Watch anime with Anilist integration and multiple language dubs (Sub, Dub, Hindi)
- **Search** - Search across all content types
- **Streaming** - Embedded streaming players with multiple provider options

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **APIs**:
  - [TMDB](https://www.themoviedb.org/) - Movies & TV shows
  - [Anilist](https://anilist.co/) - Anime metadata
  - [VidNest](https://vidnest.fun/) - Anime streaming embeds

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd CineWatch

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your TMDB API key to .env.local
# TMDB_API_KEY=your_api_key_here
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
TMDB_API_KEY=your_tmdb_api_key
```

Get your free TMDB API key at: https://www.themoviedb.org/settings/api

### Development

```bash
# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- Uses Next.js 16 with Turbopack for fast development
- Server-side rendering for optimal SEO and performance
- Image optimization via next/image with remote patterns configured
- Tailwind CSS v4 with CSS-based configuration

## License

MIT