import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import AnimeEpisodes from "@/app/components/AnimeEpisodes";
import WatchlistButton from "@/app/components/WatchlistButton";
import { getAnime } from "@/app/lib/anilist";
import { IconPlayerPlay, IconStar, IconClock, IconCalendar, IconShare } from "@tabler/icons-react";
import ShareButton from "@/app/components/ShareButton";

export default async function AnimeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { id } = await params;
  const { ep } = await searchParams;
  const animeId = Number(id);
  const currentEpisode = ep ? Number(ep) : 1;
  
  if (isNaN(animeId)) {
    notFound();
  }

  let anime;
  try {
    anime = await getAnime(animeId);
  } catch {
    notFound();
  }

  if (!anime) {
    notFound();
  }

  const topCharacters = anime.characters.edges.slice(0, 12);
  const recommendations = anime.recommendations.edges.slice(0, 6);
  const studios = anime.studios.nodes.filter((s) => s.isAnimationStudio);
  const title = anime.title.english || anime.title.romaji;
  const score = anime.averageScore ? (anime.averageScore / 10).toFixed(1) : "N/A";
  const status = anime.status?.replace(/_/g, " ") || "Unknown";
  const format = anime.format || "TV";
  const season = anime.season && anime.seasonYear ? `${anime.season} ${anime.seasonYear}` : "";
  const duration = anime.duration ? `${anime.duration} min` : "";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 sm:px-8 py-12">
        {anime.bannerImage && (
          <div className="relative w-full aspect-video max-h-[480px] overflow-hidden rounded-2xl border border-glass-border mb-10">
            <Image
              src={anime.bannerImage}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-10">
          <div className="shrink-0">
            <div className="relative w-52 md:w-64 aspect-[2/3] rounded-xl overflow-hidden border border-glass-border mx-auto md:mx-0">
              <Image
                src={anime.coverImage.large || "https://placehold.co/384x576/0a0a0a/71717a?text=No+Image"}
                alt={title}
                fill
                sizes="(max-width: 768px) 208px, 256px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {title}
            </h1>
            {anime.title.native && (
              <p className="text-muted-foreground mt-2">{anime.title.native}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-5 text-sm">
              <span className="flex items-center gap-1.5">
                <IconStar className="w-4 h-4 text-amber-400" fill="currentColor" stroke={1.5} />
                <span className="font-semibold">{score}</span>
                <span className="text-muted-foreground">({anime.popularity?.toLocaleString()} users)</span>
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span className="text-zinc-400">{format}</span>
              {anime.episodes && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <IconCalendar className="w-4 h-4" stroke={1.5} />
                    {anime.episodes} episodes
                  </span>
                </>
              )}
              {duration && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <IconClock className="w-4 h-4" stroke={1.5} />
                    {duration}
                  </span>
                </>
              )}
              {season && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="text-zinc-400">{season}</span>
                </>
              )}
              <span className="text-muted-foreground/50">|</span>
              <span className="text-zinc-400">{status}</span>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-5">
              {anime.genres.map((g) => (
                <span
                  key={g}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium glass"
                >
                  {g}
                </span>
              ))}
            </div>

            {studios.length > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                Studio: {studios.map((s) => s.name).join(", ")}
              </p>
            )}

            <div className="mt-8 flex gap-4">
              <Link
                href={`/anime/${anime.id}/watch`}
                className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-accent text-accent-foreground font-medium text-sm hover:bg-accent-hover transition-colors"
              >
                <IconPlayerPlay className="w-5 h-5" fill="currentColor" stroke={1.5} />
                Watch Now
              </Link>
              <WatchlistButton id={anime.id} type="anime" title={title} poster={anime.coverImage.large || ""} />
              <ShareButton title={title} />
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3">Synopsis</h2>
              <div
                className="text-zinc-400 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: anime.description || "No synopsis available." }}
              />
            </div>
          </div>
        </div>

        {anime.episodes && anime.episodes > 1 && (
          <AnimeEpisodes
            animeId={animeId}
            animeTitle={title}
            episodes={anime.episodes}
            currentEpisode={currentEpisode}
          />
        )}

        {topCharacters.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold mb-6">Characters</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
              {topCharacters.map(({ node, role }) => (
                <div key={node.id} className="text-center">
                  <div className="relative w-full aspect-square rounded-full overflow-hidden border border-glass-border bg-muted mx-auto">
                    <Image
                      src={
                        node.image?.large ||
                        node.image?.medium ||
                        "https://placehold.co/185x185/0a0a0a/71717a?text=?"
                      }
                      alt={node.name.full}
                      fill
                      sizes="185px"
                      className="object-cover"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium truncate">{node.name.full}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {role}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {recommendations.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold mb-6">Recommendations</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {recommendations.map(({ node }) => (
                <Link
                  key={node.mediaRecommendation.id}
                  href={`/anime/${node.mediaRecommendation.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden glass-subtle transition-colors duration-200 group-hover:border-white/[0.05]">
                    <Image
                      src={node.mediaRecommendation.coverImage.large || "https://placehold.co/384x576/0a0a0a/71717a?text=No+Image"}
                      alt={node.mediaRecommendation.title.english || node.mediaRecommendation.title.romaji}
                      fill
                      sizes="185px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium truncate px-0.5">
                    {node.mediaRecommendation.title.english || node.mediaRecommendation.title.romaji}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
