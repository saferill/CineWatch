import moli from "@utils/moli";

interface NewApiGenre {
    data: { name: string; slug: string; url: string }[];
}

interface AllGenres {
  genreList: GenreLinkCard[];
}

export default async function genreService() {
  const result = await moli<NewApiGenre>("/genres");

  const genreList: GenreLinkCard[] = (result.data.data || []).map((item) => ({
      title: item.name,
      genreId: item.slug
  }));

  return { ...result, data: { genreList } };
}
