import moli from "@utils/moli";

interface NewApiCompleted {
    completed_donghua: any[];
}

interface Batch {
  batchList: animeCard2[];
}

export default async function batchService(queryParam: {
  page?: string | number | null;
} = {}) {
  const { page } = queryParam;
  const result = await moli<NewApiCompleted>(`/completed/${page || 1}`);

  const batchList: animeCard2[] = (result.data.completed_donghua || []).map((item) => ({
      title: item.title,
      poster: item.poster,
      status: item.status,
      type: item.type,
      score: "N/A",
      animeId: item.slug,
      batchId: item.slug, 
      genreList: []
  }));

  return { ...result, data: { batchList } };
}