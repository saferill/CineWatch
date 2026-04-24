const ANILIST_API = "https://graphql.anilist.co";

async function anilistFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Anilist error: ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

export interface AnilistTitle {
  romaji: string;
  english: string | null;
  native: string | null;
}

export interface AnilistImage {
  large: string | null;
  extraLarge: string | null;
  medium: string | null;
}

export interface AnilistExternalLink {
  id: number;
  site: string;
  url: string;
  type: "STREAMING" | "SOCIAL" | "INFO";
  color: string | null;
  icon: string | null;
  notes: string | null;
  language: string | null;
}

export interface AnilistCharacter {
  id: number;
  name: {
    full: string;
    native: string | null;
  };
  image: {
    large: string | null;
    medium: string | null;
  };
  role: "MAIN" | "SUPPORTING" | "BACKGROUND";
}

export interface AnilistMedia {
  id: number;
  title: AnilistTitle;
  coverImage: AnilistImage;
  bannerImage: string | null;
  format: string | null;
  episodes: number | null;
  status: string | null;
  season: string | null;
  seasonYear: number | null;
  averageScore: number | null;
  popularity: number | null;
  genres: string[];
  description: string | null;
  duration: number | null;
  source: string | null;
  studios: {
    nodes: {
      id: number;
      name: string;
      isAnimationStudio: boolean;
    }[];
  };
  externalLinks: AnilistExternalLink[];
  characters: {
    edges: {
      node: AnilistCharacter;
      role: string;
    }[];
  };
  relations: {
    edges: {
      relationType: string;
      node: {
        id: number;
        title: AnilistTitle;
        coverImage: AnilistImage;
        format: string | null;
        episodes: number | null;
      };
    }[];
  };
  recommendations: {
    edges: {
      node: {
        mediaRecommendation: {
          id: number;
          title: AnilistTitle;
          coverImage: AnilistImage;
          format: string | null;
          episodes: number | null;
          averageScore: number | null;
        };
      };
    }[];
  };
  nextAiringEpisode: {
    airingAt: number;
    episode: number;
  } | null;
}

export interface AnilistPageInfo {
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
  total: number;
}

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  coverImage { large extraLarge medium }
  bannerImage
  format
  episodes
  status
  season
  seasonYear
  averageScore
  popularity
  genres
  description
  duration
  source
  studios { nodes { id name isAnimationStudio } }
  externalLinks { id site url type color icon notes language }
  characters(perPage: 15) { edges { node { id name { full native } image { large medium } } role } }
  relations { edges { relationType node { id title { romaji english } coverImage { large } format episodes } } }
  recommendations(perPage: 6) { edges { node { mediaRecommendation { id title { romaji english } coverImage { large } format episodes averageScore } } } }
  nextAiringEpisode { airingAt episode }
`;

export async function getAnime(id: number): Promise<AnilistMedia> {
  const data = await anilistFetch<{ Media: AnilistMedia }>(
    `query($id: Int) { Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} } }`,
    { id }
  );
  return data.Media;
}

export async function getTrendingAnime(page = 1, perPage = 10): Promise<{ media: AnilistMedia[]; pageInfo: AnilistPageInfo }> {
  const data = await anilistFetch<{ Page: { media: AnilistMedia[]; pageInfo: AnilistPageInfo } }>(
    `query($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC) { ${MEDIA_FIELDS} }
        pageInfo { currentPage lastPage hasNextPage perPage total }
      }
    }`,
    { page, perPage }
  );
  return { media: data.Page.media, pageInfo: data.Page.pageInfo };
}

export async function getPopularAnime(page = 1, perPage = 10): Promise<{ media: AnilistMedia[]; pageInfo: AnilistPageInfo }> {
  const data = await anilistFetch<{ Page: { media: AnilistMedia[]; pageInfo: AnilistPageInfo } }>(
    `query($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
        pageInfo { currentPage lastPage hasNextPage perPage total }
      }
    }`,
    { page, perPage }
  );
  return { media: data.Page.media, pageInfo: data.Page.pageInfo };
}

export async function getTopRatedAnime(page = 1, perPage = 10): Promise<{ media: AnilistMedia[]; pageInfo: AnilistPageInfo }> {
  const data = await anilistFetch<{ Page: { media: AnilistMedia[]; pageInfo: AnilistPageInfo } }>(
    `query($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: SCORE_DESC) { ${MEDIA_FIELDS} }
        pageInfo { currentPage lastPage hasNextPage perPage total }
      }
    }`,
    { page, perPage }
  );
  return { media: data.Page.media, pageInfo: data.Page.pageInfo };
}

export async function getAiringAnime(page = 1, perPage = 10): Promise<{ media: AnilistMedia[]; pageInfo: AnilistPageInfo }> {
  const data = await anilistFetch<{ Page: { media: AnilistMedia[]; pageInfo: AnilistPageInfo } }>(
    `query($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
        pageInfo { currentPage lastPage hasNextPage perPage total }
      }
    }`,
    { page, perPage }
  );
  return { media: data.Page.media, pageInfo: data.Page.pageInfo };
}

export async function searchAnime(query: string, page = 1, perPage = 10): Promise<{ media: AnilistMedia[]; pageInfo: AnilistPageInfo }> {
  const data = await anilistFetch<{ Page: { media: AnilistMedia[]; pageInfo: AnilistPageInfo } }>(
    `query($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, search: $search, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} }
        pageInfo { currentPage lastPage hasNextPage perPage total }
      }
    }`,
    { search: query, page, perPage }
  );
  return { media: data.Page.media, pageInfo: data.Page.pageInfo };
}
