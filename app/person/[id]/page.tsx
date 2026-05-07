import Image from "next/image";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import MovieCard from "@/app/components/MovieCard";
import { getPerson, getPersonCredits } from "@/app/lib/tmdb";
import { posterUrl } from "@/app/lib/tmdb-utils";
import { IconCake, IconMapPin, IconBriefcase } from "@tabler/icons-react";

function calculateAge(birthday: string | null, deathday: string | null): number | null {
  if (!birthday) return null;
  const birth = new Date(birthday);
  if (isNaN(birth.getTime())) return null;
  const end = deathday ? new Date(deathday) : new Date();
  if (isNaN(end.getTime())) return null;
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const personId = Number(id);

  if (isNaN(personId)) notFound();

  let person, credits;
  try {
    [person, credits] = await Promise.all([
      getPerson(personId),
      getPersonCredits(personId),
    ]);
  } catch {
    notFound();
  }

  if (!person) notFound();

  const age = calculateAge(person.birthday, person.deathday);

  const sortedCredits = [...credits.cast]
    .filter((c) => c.poster_path)
    .sort((a, b) => {
      const dateA = a.release_date || a.first_air_date || "";
      const dateB = b.release_date || b.first_air_date || "";
      return dateB.localeCompare(dateA);
    });

  const movieCredits = sortedCredits.filter((c) => c.media_type === "movie");
  const tvCredits = sortedCredits.filter((c) => c.media_type === "tv");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="shrink-0">
            <div className="relative w-52 md:w-64 aspect-[2/3] rounded-xl overflow-hidden border border-glass-border mx-auto md:mx-0">
              <Image
                src={posterUrl(person.profile_path, "w500")}
                alt={person.name}
                fill
                sizes="(max-width: 768px) 208px, 256px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {person.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-5 text-sm">
              {person.birthday && (
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <IconCake className="w-4 h-4" stroke={1.5} />
                  {formatDate(person.birthday)}
                  {age !== null && (
                    <span className="text-muted-foreground">
                      ({age} {person.deathday ? "at death" : "years old"})
                    </span>
                  )}
                </span>
              )}
              {person.deathday && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="text-zinc-400">
                    Died {formatDate(person.deathday)}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              {person.place_of_birth && (
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <IconMapPin className="w-4 h-4" stroke={1.5} />
                  {person.place_of_birth}
                </span>
              )}
              {person.known_for_department && (
                <>
                  {person.place_of_birth && <span className="text-muted-foreground/50">|</span>}
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <IconBriefcase className="w-4 h-4" stroke={1.5} />
                    {person.known_for_department}
                  </span>
                </>
              )}
            </div>

            {person.biography && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-3">Biography</h2>
                <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            )}
          </div>
        </div>

        {movieCredits.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold mb-6">Movies ({movieCredits.length})</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {movieCredits.map((credit) => (
                <MovieCard
                  key={`movie-${credit.id}`}
                  movie={{
                    id: credit.id,
                    title: credit.title || "",
                    overview: "",
                    poster_path: credit.poster_path,
                    backdrop_path: null,
                    release_date: credit.release_date || "",
                    vote_average: credit.vote_average ?? 0,
                    vote_count: 0,
                    genre_ids: [],
                    popularity: 0,
                    adult: false,
                    original_language: "",
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {tvCredits.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold mb-6">TV Shows ({tvCredits.length})</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {tvCredits.map((credit) => (
                <MovieCard
                  key={`tv-${credit.id}`}
                  movie={{
                    id: credit.id,
                    name: credit.name || "",
                    overview: "",
                    poster_path: credit.poster_path,
                    backdrop_path: null,
                    first_air_date: credit.first_air_date || "",
                    vote_average: credit.vote_average ?? 0,
                    vote_count: 0,
                    genre_ids: [],
                    popularity: 0,
                    adult: false,
                    original_language: "",
                  }}
                  isTV
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
