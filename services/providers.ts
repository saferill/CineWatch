import { MovieResponse } from '@/types/movie-result'
import { fetchClient } from '@/lib/fetch-client'
import { apiConfig } from '@/lib/tmdbConfig'

/**
 * Fetch movies available on a specific streaming provider.
 * TMDB uses the `with_watch_providers` query param on the discover endpoint.
 * The provider IDs are defined in the component mapping.
 */
export const getMoviesByProvider = async (providerId: number): Promise<MovieResponse | null> => {
  try {
    const url = `discover/movie?with_watch_providers=${providerId}&language=en-US&watch_region=US`
    // Use header auth to include the API key from tmdbConfig
    const data = await fetchClient.get<MovieResponse>(url, {}, true)
    return data
  } catch (error) {
    console.error('Error fetching movies for provider', providerId, error)
    return null
  }
}
