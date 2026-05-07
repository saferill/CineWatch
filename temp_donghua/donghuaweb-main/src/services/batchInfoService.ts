import moli from "@utils/moli";

interface NewApiDetail {
    title: string;
    alter_title: string;
    poster: string;
    rating: string;
    studio: string;
    released: string;
    duration: string;
    episodes_count: string;
    season: string;
    type: string;
    status: string;
    genres: { name: string; slug: string; url: string }[];
    synopsis: string;
}

interface animeBatch {
  title: string;
  animeId: string;
  japanese: string;
  synonyms: string;
  english: string;
  status: string;
  type: string;
  source: string;
  score: string;
  duration: string;
  episodes: number | null;
  season: string;
  studios: string;
  producers: string;
  aired: string;
  releasedOn: string;
  poster: string;
  synopsis: Synopsis;
  genreList: GenreLinkCard[];
  downloadUrl: { formats: Format[] };
  recommendedanimeList: animeCard6[];
}

export default async function batchInfoService(routeParams: {
  batchId: string;
}) {
  const { batchId } = routeParams;
  const result = await moli<NewApiDetail>(`/detail/${batchId}`);
  const raw = result.data;

  const mappedData: animeBatch = {
      title: raw.title,
      animeId: batchId,
      japanese: raw.alter_title,
      synonyms: raw.alter_title,
      english: raw.title,
      status: raw.status || "Completed",
      type: raw.type,
      source: "Original",
      score: raw.rating || "N/A",
      duration: raw.duration,
      episodes: parseInt(raw.episodes_count) || null,
      season: raw.season,
      studios: raw.studio,
      producers: "",
      aired: raw.released,
      releasedOn: raw.released,
      poster: raw.poster,
      synopsis: {
          paragraphs: [raw.synopsis],
          connections: []
      },
      genreList: (raw.genres || []).map(g => ({
          title: g.name,
          genreId: g.slug
      })),
      downloadUrl: { formats: [] }, 
      recommendedanimeList: []
  };

  return { ...result, data: mappedData };
}
