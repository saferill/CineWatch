import moli from "@utils/moli";

interface Azanime {
  donghua_list: any[];
}

export default async function azanimeService(
  routeParams: {
    letter: string;
  },
  queryParam: {
    page?: string | number | null;
  }
) {
  const { letter } = routeParams;
  const { page } = queryParam;
  const result = await moli<Azanime>(`/az-list/${letter}/${page || 1}`);

  const animeList: animeCard2[] = (result.data.donghua_list || []).map((item) => ({
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