import React from 'react'
import Link from 'next/link'

import { SeriesDetails } from '@/types/series-details'
import { SEARCH_ACTOR_GOOGLE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { HeroRatesInfos } from '@/components/header/hero-rates-info'
import { Icons } from '@/components/icons'
import { seriesExtraInfoFormatter } from '@/components/media/extra-info'
import { buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'

interface SeriesDetailsExtraInfoProps {
  series: SeriesDetails
  director: string | undefined
  trailerId?: string | null
}

export const SeriesDetailsExtraInfo = ({
  series,
  director,
  trailerId,
}: SeriesDetailsExtraInfoProps) => {
  const extraInfo = seriesExtraInfoFormatter(series, director)
  return (
    <section>
      <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold lg:text-3xl">{series.name}</p>
          <HeroRatesInfos seriesDetails={series} />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {trailerId && (
            <Dialog>
              <DialogTrigger asChild>
                <button className={cn(
                    buttonVariants({ size: 'lg', variant: 'outline' }),
                    "rounded-full h-12 px-6 font-semibold"
                  )}>
                  <Icons.playIcon className="mr-2 h-4 w-4" />
                  Watch Trailer
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none aspect-video">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${trailerId}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </DialogContent>
            </Dialog>
          )}
          <Link
            href={`/series/${series.id}/watch`}
            className={cn(
              buttonVariants({ size: 'lg', variant: 'default' }),
              "bg-white text-black hover:bg-zinc-200 font-bold px-8 rounded-full h-12 text-md"
            )}
          >
            <Icons.playIcon className="mr-2 h-5 w-5" />
            Watch Series
          </Link>
        </div>
      </div>
      <p className="prose-invert text-xs font-semibold lg:text-lg">
        {series.overview}
      </p>
      <div className="my-4 flex max-w-lg flex-col space-y-1">
        {extraInfo.map((info) => (
          <div
            key={info.name}
            className="grid grid-cols-2 text-sm font-semibold lg:text-lg"
          >
            <p className="text-muted-foreground">{info.name}</p>
            {info.isLink ? (
              <Link
                href={`${SEARCH_ACTOR_GOOGLE}${info.value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-fit transition-all ease-in-out hover:text-cyan-200"
              >
                <span className="inline-flex items-center gap-1">
                  <span className="underline underline-offset-4">
                    {info.value}
                  </span>
                  <Icons.arrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
                </span>
              </Link>
            ) : (
              <p className={cn(info.className)}>{info.value}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
