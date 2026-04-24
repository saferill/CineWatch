import Navbar from "@/app/components/Navbar";
import MovieGrid from "@/app/components/MovieGrid";
import { getPopular, getTopRated, getTrending } from "@/app/lib/tmdb";
import { IconMovie } from "@tabler/icons-react";

export const metadata = {
  title: "Movies — CineWatch",
  description: "Browse trending, popular, and top rated movies.",
};

export default async function MoviesPage() {
  const [trending, popular, topRated] = await Promise.all([
    getTrending(),
    getPopular(),
    getTopRated(),
  ]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <IconMovie className="w-6 h-6 text-accent" stroke={2} />
          </div>
          <div>
            <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">Browse</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Movies</h1>
          </div>
        </div>

        <div className="space-y-12">
          <MovieGrid movies={trending} title="Trending Now" />
          <MovieGrid movies={popular} title="Most Popular" />
          <MovieGrid movies={topRated} title="Top Rated All Time" />
        </div>
      </main>
    </>
  );
}
