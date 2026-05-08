
import MovieGrid from "@/app/components/MovieGrid";
import LoadMore from "@/app/components/LoadMore";
import { getTrendingAnime, getPopularAnime, getTopRatedAnime } from "@/app/lib/anilist";
import { fetchPopularAnime } from "@/app/actions/movieActions";
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
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-5 mb-12">
          <div className="size-14 rounded-[1.5rem] bg-accent/10 border border-accent/20 flex items-center justify-center shadow-2xl">
            <IconMoodHappy className="size-7 text-accent" stroke={2.5} />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent italic">Anime</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Nonton anime terbaik pilihan kami</p>
          </div>
        </div>

        <div className="space-y-12">
          <MovieGrid movies={trending.media} title="Trending Now" isAnime />
          <MovieGrid movies={popular.media} title="Most Popular" isAnime />
          <MovieGrid movies={topRated.media} title="Top Rated All Time" isAnime />
          
          <div className="pt-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-7 bg-accent rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">Discover More</h2>
            </div>
            <LoadMore fetchAction={fetchPopularAnime} initialPage={1} isAnime />
          </div>
        </div>
      </main>
    </>
  );
}
