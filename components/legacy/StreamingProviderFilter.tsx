"use client"
import React, { useState, useEffect } from 'react'
import { List } from '@/components/list'
import { SliderHorizontalListLoader } from '@/components/loaders/slider-horizontal-list-loader'
import { Movie } from '@/types/movie-result'
import { getMoviesByProvider } from '@/services/providers'

// Mapping of popular streaming services to TMDB provider IDs
const PROVIDERS: Record<string, number> = {
  Netflix: 8,
  'Prime Video': 9,
  Hulu: 15,
  DisneyPlus: 337,
  'Apple TV+': 350,
}

export const StreamingProviderFilter = () => {
  const [selected, setSelected] = useState<string>('')
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selected) return
    const fetchMovies = async () => {
      setLoading(true)
      try {
        const result = await getMoviesByProvider(PROVIDERS[selected])
        setMovies(result?.results || [])
      } catch (e) {
        console.error('Failed to fetch movies for provider', selected, e)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [selected])

  return (
    <div className="my-8">
      <label className="mr-2 font-medium">Select Streaming Provider:</label>
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="border rounded p-1"
      >
        <option value="">-- Choose --</option>
        {Object.keys(PROVIDERS).map(name => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {loading && <SliderHorizontalListLoader />}

      {!loading && movies.length > 0 && (
        <List
          title={`Movies from ${selected}`}
          items={movies}
          itemType="movie"
        />
      )}
    </div>
  )
}
