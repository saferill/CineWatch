export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
}

export interface MovieDetail extends Movie {
  runtime: number;
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  genres: Genre[];
  production_companies: ProductionCompany[];
  spoken_languages: SpokenLanguage[];
  imdb_id: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Credits {
  cast: CastMember[];
}

export interface Person {
  id: number;
  name: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  biography: string;
  profile_path: string | null;
  place_of_birth: string | null;
  popularity: number;
  known_for_department: string;
}

export interface PersonCredit {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: "movie" | "tv";
  character: string;
  episode_count?: number;
}

export interface PersonCredits {
  cast: PersonCredit[];
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface VideosResponse {
  results: Video[];
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
}

export interface TVShowDetail extends TVShow {
  runtime: number | null;
  status: string;
  tagline: string;
  number_of_seasons: number;
  number_of_episodes: number;
  genres: Genre[];
  seasons: Season[];
}

export interface Season {
  air_date: string | null;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
}

export interface Episode {
  air_date: string | null;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  runtime: number | null;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface SeasonDetail extends Season {
  episodes: Episode[];
}

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  synopsis: string | null;
  score: number | null;
  scored_by: number;
  episodes: number | null;
  status: string;
  type: string;
  rating: string | null;
  season: string | null;
  year: number | null;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  genres: {
    mal_id: number;
    name: string;
    type: string;
  }[];
  studios: {
    mal_id: number;
    name: string;
    type: string;
  }[];
  aired: {
    from: string | null;
    to: string | null;
    string: string;
  };
  popularity: number;
  members: number;
  favorites: number;
  rank: number | null;
}

export interface JikanAnimeDetail extends JikanAnime {
  trailer: {
    youtube_id: string | null;
    url: string | null;
    embed_url: string | null;
  };
  background: string | null;
  source: string;
  duration: string;
  producers: {
    mal_id: number;
    name: string;
    type: string;
  }[];
  licensors: {
    mal_id: number;
    name: string;
    type: string;
  }[];
  themes: {
    mal_id: number;
    name: string;
    type: string;
  }[];
  demographics: {
    mal_id: number;
    name: string;
    type: string;
  }[];
  title_synonyms: string[];
}

export interface JikanCharacter {
  character: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  role: string;
  voice_actors: {
    person: {
      mal_id: number;
      name: string;
    };
    language: string;
  }[];
}

export interface JikanResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
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

export interface AnilistAnime {
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
