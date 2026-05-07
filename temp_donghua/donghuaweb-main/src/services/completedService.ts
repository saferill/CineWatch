import moli from "@utils/moli";

interface NewApiCompleted {
    completed_donghua: any[];
}

interface animes {
  animeList: animeCard2[];
}

export default async function completedService(queryParam: {
  page?: string | number | null;
} = {}) {
  const { page } = queryParam;
  const result = await moli<NewApiCompleted>(`/completed/${page || 1}`);

  const animeList: animeCard2[] = (result.data.completed_donghua || []).map((item) => ({
      title: item.title,
      poster: item.poster,
      status: item.status,
      type: item.type || "anime",
      score: "N/A",
      animeId: item.slug,
      href: `/anime/${item.slug}`,
      genreList: []
  }));

  return { ...result, data: { animeList } };
}