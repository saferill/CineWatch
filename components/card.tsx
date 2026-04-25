import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarDays, Play } from 'lucide-react'

import { MediaType } from '@/types/media'
import { ItemType } from '@/types/movie-result'
import { CARD_VARIANT } from '@/lib/motion-variants'
import {
  dateFormatter,
  getPosterImageURL,
  itemRedirect,
  itemDetailRedirect,
  numberRounder,
} from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { BlurredImage } from '@/components/blurred-image'

interface CardProps {
  item: MediaType
  itemType?: ItemType
  isTruncateOverview?: boolean
}

export const Card = ({
  item,
  itemType = 'movie',
  isTruncateOverview = true,
}: CardProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {item?.poster_path && (
          <Link href={`${itemDetailRedirect(itemType)}/${item.id}`}>
            <motion.div
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="pointer-events-none lg:pointer-events-auto"
            >
              <motion.div className="group relative overflow-hidden rounded-md shadow-lg shadow-black/50 transition-all duration-300 hover:shadow-cyan-500/20" variants={CARD_VARIANT}>
                <BlurredImage
                  src={`${getPosterImageURL(item.poster_path)}`}
                  alt={item.title || item.name || 'Movie'}
                  width={250}
                  height={375}
                  className="cursor-pointer object-cover transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute left-2 top-2 z-20 flex flex-col gap-1.5">
                  <Badge variant="secondary" className="w-fit bg-black/60 text-[10px] text-white backdrop-blur-md">
                    HD
                  </Badge>
                  {item.vote_average ? (
                    <Badge variant="secondary" className="w-fit bg-cyan-500/80 text-[10px] text-white backdrop-blur-md">
                      ★ {(item.vote_average).toFixed(1)}
                    </Badge>
                  ) : null}
                </div>
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                  <div className="flex size-14 items-center justify-center rounded-full bg-cyan-500/90 shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-transform duration-300 hover:bg-cyan-400 group-hover:scale-110">
                    <Play className="ml-1 size-6 fill-white text-white" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </Link>
        )}
      </HoverCardTrigger>
      <HoverCardContent className="hidden w-80 md:block" side="right">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <AvatarImage src="/personal-logo.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold">
                {item?.title} ({item?.release_date?.slice(0, 4)})
              </h4>
              <Badge>{numberRounder(item.vote_average)}</Badge>
            </div>
            <p className="text-sm">
              {isTruncateOverview && item.overview.length > 100 ? (
                <>{item.overview.slice(0, 100)}...</>
              ) : (
                item.overview.slice(0, 400)
              )}
            </p>
            <div className="flex items-center pt-2">
              <CalendarDays className="mr-2 size-4 opacity-70" />{' '}
              <span className="text-xs text-muted-foreground">
                {dateFormatter(item?.release_date, true)}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
