import { getMovieTrailer, getTVTrailer } from '@/lib/legacy/tmdb'

export async function getTrailerAction(id: number, type: 'movie' | 'tv') {
  if (type === 'tv') {
    const video = await getTVTrailer(id)
    return video?.key || null
  } else {
    const video = await getMovieTrailer(id)
    return video?.key || null
  }
}
