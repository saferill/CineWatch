import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { getMovie, getMovieCredits } from "@/app/lib/tmdb";
import { posterUrl } from "@/app/lib/tmdb-utils";
import { IconArrowLeft } from "@tabler/icons-react";

export default async function CastPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);

  if (isNaN(movieId)) notFound();

  let movie, credits;
  try {
    [movie, credits] = await Promise.all([getMovie(movieId), getMovieCredits(movieId)]);
  } catch {
    notFound();
  }

  if (!movie) notFound();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 sm:px-8 py-12">
        <Link
          href={`/movie/${movieId}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <IconArrowLeft className="w-4 h-4" stroke={2} />
          Back to {movie.title}
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">{movie.title}</h1>
        <p className="text-muted-foreground mb-10">Full Cast & Crew</p>

        {credits.cast.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-6">Cast ({credits.cast.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {credits.cast.map((member) => (
                <Link
                  key={member.id}
                  href={`/person/${member.id}`}
                  className="glass-subtle rounded-xl overflow-hidden group"
                >
                  <div className="relative w-full aspect-[3/4]">
                    <Image
                      src={
                        member.profile_path
                          ? posterUrl(member.profile_path, "w342")
                          : "https://placehold.co/342x513/0a0a0a/71717a?text=?"
                      }
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate group-hover:text-accent transition-colors">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {member.character}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
