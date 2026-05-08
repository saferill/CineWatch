
import MovieCard from "@/app/components/MovieCard";
import LoadMore from "@/app/components/LoadMore";
import { getMoviesByGenre, getTVByGenre } from "@/app/lib/tmdb";
import { fetchMoviesByGenre, fetchTVByGenre } from "@/app/actions/movieActions";
import { IconFilter, IconMovie, IconDeviceTv } from "@tabler/icons-react";

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ g?: string, t?: string }> }) {
  const { g, t } = await searchParams;
  const activeGenreId = g ? parseInt(g) : 28;
  const type = t === "tv" ? "tv" : "movie";

  const data = type === "movie"
    ? await getMoviesByGenre(activeGenreId)
    : await getTVByGenre(activeGenreId);

  const activeGenreName = GENRES.find(genre => genre.id === activeGenreId)?.name || "Action";

  return (
    <>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-2 bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent italic">Explore</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Temukan tontonan berdasarkan genre</p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit">
            <a
              href={`/explore?g=${activeGenreId}&t=movie`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${type === "movie" ? "bg-accent text-accent-foreground shadow-lg" : "text-zinc-500 hover:text-white"}`}
            >
              Movies
            </a>
            <a
              href={`/explore?g=${activeGenreId}&t=tv`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${type === "tv" ? "bg-accent text-accent-foreground shadow-lg" : "text-zinc-500 hover:text-white"}`}
            >
              TV Series
            </a>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Genres */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-2">Genres</h3>
              <nav className="flex flex-nowrap lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-4 lg:pb-0">
                {GENRES.map((genre) => (
                  <a
                    key={genre.id}
                    href={`/explore?g=${genre.id}&t=${type}`}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeGenreId === genre.id
                        ? "bg-accent text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        : "text-zinc-500 hover:text-white hover:bg-white/[0.05]"
                      }`}
                  >
                    {genre.name}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-1.5 h-7 bg-accent rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic">{activeGenreName} {type === "movie" ? "Movies" : "Series"}</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-4 gap-y-10 sm:gap-6 md:gap-8">
              {data.map((item) => (
                <MovieCard
                  key={item.id}
                  movie={item as any}
                  isTV={type === "tv"}
                />
              ))}
            </div>

            <LoadMore
              fetchAction={type === "movie"
                ? fetchMoviesByGenre.bind(null, activeGenreId)
                : fetchTVByGenre.bind(null, activeGenreId)
              }
              initialPage={1}
              isTV={type === "tv"}
            />
          </div>
        </div>
      </main>
    </>
  );
}
