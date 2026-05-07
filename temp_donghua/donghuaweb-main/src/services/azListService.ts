
import moli from "@utils/moli";

interface AZList {
  az_list_letters: {
    letter: string;
    slug: string;
    url: string;
  }[];
}

export default async function azListService() {
  const result = await moli<AZList>("/az-list");
  return result;
}