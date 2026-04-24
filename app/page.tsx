import Navbar from "@/app/components/Navbar";
import HeroCarousel from "@/app/components/HeroCarousel";
import MovieGrid from "@/app/components/MovieGrid";
import ContinueWatching from "@/app/components/ContinueWatching";
import HomeTabsSection from "@/app/components/HomeTabsSection";
import {
  getTrending,
  getPopular,
  getTopRated,
  getTrendingTV,
  getPopularTV,
  getTopRatedTV,
  searchMovies,
  searchTVShows,
  getMovieLogo,
} from "@/app/lib/tmdb";
import {
  getTrendingAnime,
  getPopularAnime,
  getTopRatedAnime,
  searchAnime,
} from "@/app/lib/anilist";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : undefined;

  if (query) {
    const [movies, tvShows, anime] = await Promise.all([
      searchMovies(query),
      searchTVShows(query),
      searchAnime(query),
    ]);

    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          {/* Search header */}
          <div>
            <p className="text-sm text-zinc-500 mb-1">Search results for</p>
            <h1 className="text-2xl sm:text-3xl font-bold">
              &ldquo;<span className="text-gradient-accent">{query}</span>&rdquo;
            </h1>
          </div>
          <MovieGrid movies={movies} title="Movies" viewAllHref="/movies" />
          {tvShows.length > 0 && (
            <MovieGrid movies={tvShows} title="TV Series" isTV viewAllHref="/series" />
          )}
          {anime.media.length > 0 && (
            <MovieGrid movies={anime.media} title="Anime" isAnime viewAllHref="/anime" />
          )}
        </main>
      </>
    );
  }

  const [
    trending,
    popular,
    topRated,
    trendingTV,
    popularTV,
    topRatedTV,
    trendingAnime,
    popularAnime,
    topRatedAnime,
  ] = await Promise.all([
    getTrending(),
    getPopular(),
    getTopRated(),
    getTrendingTV(),
    getPopularTV(),
    getTopRatedTV(),
    getTrendingAnime(undefined, 10),
    getPopularAnime(undefined, 10),
    getTopRatedAnime(undefined, 10),
  ]);

  const featured = trending.slice(0, 5);
  const logos = await Promise.all(
    featured.map((m) => getMovieLogo(m.id).catch(() => null))
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Hero Carousel */}
        {featured.length > 0 && (
          <HeroCarousel movies={featured} logos={logos} />
        )}

        {/* Continue Watching */}
        <ContinueWatching />

        {/* Category Tabs */}
        <HomeTabsSection
          moviesData={{ trending, popular, topRated }}
          seriesData={{ trendingTV, popularTV, topRatedTV }}
          animeData={{
            trending: trendingAnime.media,
            popular: popularAnime.media,
            topRated: topRatedAnime.media,
          }}
        />
      </main>
    </>
  );
}
