import moli from "@utils/moli";

interface NewApiLatest {
    latest_donghua: any[];
}

interface RecentEpisodes {
  animeList: animeCard1[];
}

export default async function recentService(queryParam: {
  page?: string | number | null;
} = {}) {
  const { page } = queryParam;
  const result = await moli<NewApiLatest>(`/latest/${page || 1}`);

  const animeList: animeCard1[] = (result.data.latest_donghua || []).map((item) => ({
      title: item.title,
      poster: item.poster,
      episodes: (item.current_episode || "??").replace(/Ep\s*/i, "").trim(),
      releasedOn: "Baru",
      animeId: item.slug,
      href: `/episode/${item.slug}` 
  }));

  return { ...result, data: { animeList } };
}