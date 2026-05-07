import moli from "@utils/moli";

export interface Allanimes {
  list: {
    startWith: string;
    animeList: animeLinkCard[];
  }[];
}

export default async function homeService() {
  const result = await moli<Allanimes>("/anime");

  return result;
}
