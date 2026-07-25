export type ItemType = 'movie' | 'tv' | 'person' | 'anime' | 'donghua'

export interface Movie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  title?: string;
  name?: string;
  first_air_date?: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  media_type?: ItemType;
}

export interface MovieResponse {
  page: number
  results: Movie[]
  total_pages?: number
  total_results?: number
}

export type Param = Record<string, string | number>

export interface MultiRequestProps {
  trendingMediaForHero: Movie[]
  latestTrendingMovies: Movie[]
  popularMovies: Movie[]
  allTimeTopRatedMovies: Movie[]
  latestTrendingSeries: Movie[]
  popularSeries: Movie[]
  allTimeTopRatedSeries: Movie[]
  epicMasterpieces: Movie[]
  actionHits: Movie[]
}

export type PopularMediaAction<T> = (params?: Param) => Promise<T>

