import Navbar from "@/app/components/Navbar";
import MovieGrid from "@/app/components/MovieGrid";
import { getTrendingAnime, getPopularAnime, getTopRatedAnime } from "@/app/lib/anilist";
import { IconMoodHappy } from "@tabler/icons-react";

export const metadata = {
  title: "Anime — CineWatch",
  description: "Browse trending, popular, and top rated anime.",
};

export default async function AnimePage() {
  const [trending, popular, topRated] = await Promise.all([
    getTrendingAnime(undefined, 20),
    getPopularAnime(undefined, 20),
    getTopRatedAnime(undefined, 20),
  ]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <IconMoodHappy className="w-6 h-6 text-purple-400" stroke={2} />
          </div>
          <div>
            <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">Browse</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Anime</h1>
          </div>
        </div>

        <div className="space-y-12">
          <MovieGrid movies={trending.media} title="Trending Now" isAnime />
          <MovieGrid movies={popular.media} title="Most Popular" isAnime />
          <MovieGrid movies={topRated.media} title="Top Rated All Time" isAnime />
        </div>
      </main>
    </>
  );
}
