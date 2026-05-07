import moli from "@utils/moli";

interface NewApiOngoing {
    ongoing_donghua: any[];
}

interface animes {
  animeList: animeCard2[];
}

export default async function ongoingService(queryParam: {
  page?: string | number | null;
} = {}) {
  const { page } = queryParam;
  const result = await moli<NewApiOngoing>(`/ongoing/${page || 1}`);

  const animeList: animeCard2[] = (result.data.ongoing_donghua || []).map((item) => ({
      title: item.title,
      poster: item.poster,
      status: item.status,
      type: "anime",
      score: "N/A",
      animeId: item.slug,
      href: `/anime/${item.slug}`,
      genreList: []
  }));

  return { ...result, data: { animeList } };
}