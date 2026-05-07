export interface DonghuaItem {
  title: string;
  poster: string;
  episodes: string; // e.g., "12" or "END"
  releasedOn: string; // e.g., "Baru" or "Tamat"
  href: string; // URL path within the app
}

export interface DonghuaHomeResponse {
  recent: DonghuaItem[];
  completed: DonghuaItem[];
}

export interface DonghuaGenre {
  name: string;
  slug: string;
}

export interface DonghuaEpisodeListItem {
  title: string;
  slug: string;
}

export interface DonghuaDetail {
  title: string;
  alterTitle: string;
  poster: string;
  rating: string;
  studio: string;
  released: string;
  duration: string;
  episodesCount: string;
  season: string;
  type: string;
  status: string;
  genres: DonghuaGenre[];
  synopsis: string;
  episodesList: DonghuaEpisodeListItem[];
}

export interface DonghuaStreamingServer {
  name: string;
  url: string;
}

export interface DonghuaEpisode {
  title: string;
  streamingUrl: string;
  servers: DonghuaStreamingServer[];
  donghua: {
    title: string;
    slug: string;
    poster: string;
  };
  navigation: {
    prev?: { slug: string; title: string };
    next?: { slug: string; title: string };
  };
}
