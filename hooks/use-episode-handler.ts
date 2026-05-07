import React from 'react'
import { getSeasonEpisodesAction } from '@/actions/season-details'
import { useQuery } from '@tanstack/react-query'

import { useSearchQueryParams } from '@/hooks/use-search-params'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export const useEpisodeHandler = (seriesID: number) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { seasonQuerySTR } = useSearchQueryParams()
  const [selectedSeason, setSelectedSeasonState] = React.useState<string>(
    seasonQuerySTR || '1'
  )

  const setSelectedSeason = React.useCallback(
    (value: React.SetStateAction<string>) => {
      setSelectedSeasonState(value)
      const season = typeof value === 'function' ? value(selectedSeason) : value
      
      const params = new URLSearchParams(searchParams.toString())
      params.set('season', season)
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams, selectedSeason]
  )

  const getSeasonEpisodes = React.useCallback(
    async (seriesId: number, seasonNumber: string) => {
      const seasonDetails = await getSeasonEpisodesAction(
        seriesId,
        seasonNumber
      )
      return seasonDetails?.episodes
    },
    []
  )
  const { data: episodes, isLoading: isEpisodesLoading } = useQuery({
    queryKey: [selectedSeason, seriesID],
    queryFn: () => getSeasonEpisodes(seriesID, selectedSeason),
    enabled: Boolean(seriesID),
  })

  return {
    selectedSeason,
    setSelectedSeason,
    getSeasonEpisodes,
    episodes,
    isEpisodesLoading,
  }
}
