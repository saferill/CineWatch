'use client'

import '@splidejs/react-splide/css'

import React from 'react'
import Link from 'next/link'
import { Splide, SplideSlide } from '@splidejs/react-splide'
import { motion } from 'framer-motion'

import { MediaType } from '@/types/media'
import { ItemType } from '@/types/movie-result'
import {
  CHANGE_COLOR_VARIANT,
  HIDDEN_TEXT_ARROW_VARIANT,
  HIDDEN_TEXT_VARIANT,
} from '@/lib/motion-variants'
import { itemRedirect } from '@/lib/utils'
import { Card } from '@/components/card'
import { Icons } from '@/components/icons'

interface ListProps {
  title: string
  items: MediaType[]
  itemType?: ItemType
}

export const List = ({ title, items = [], itemType = 'movie' }: ListProps) => {
  const isTop10 = title.toLowerCase().includes('top rated') || title.toLowerCase().includes('top 10')
  const displayItems = isTop10 ? items.slice(0, 10) : items

  return (
    <nav className="py-6 lg:py-8">
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        className="w-fit"
      >
        <Link
          href={itemRedirect(itemType)}
          className="mb-4 flex w-fit items-center gap-2"
        >
          <motion.h2
            className="flex items-center text-xl font-bold transition md:text-2xl tracking-tight"
            variants={CHANGE_COLOR_VARIANT}
          >
            <span className="mr-3 block h-6 w-1.5 rounded-full bg-linear-to-b from-blue-500 to-purple-600 shadow-[0_0_20px_rgba(37,99,235,0.6)]" />
            {title}
          </motion.h2>
          <motion.div
            className="mt-1 text-xs text-zinc-500"
            variants={HIDDEN_TEXT_VARIANT}
          >
            <span className="font-sans font-medium uppercase tracking-tighter">View All</span>
          </motion.div>
          <motion.span
            variants={HIDDEN_TEXT_ARROW_VARIANT}
            className="mt-1 text-zinc-500"
          >
            <Icons.arrowRight className="ml-1 inline-block h-3 w-3" />
          </motion.span>
        </Link>
      </motion.div>
      
      {items.length === 0 && (
        <p className="text-lg text-gray-400">No items to show</p>
      )}
      
      {items.length > 0 && (
        <Splide
          options={{
            rewind: true,
            gap: '1rem',
            arrows: true,
            pagination: false,
            autoWidth: true,
            breakpoints: {
              768: {
                gap: '0.5rem',
                arrows: false,
              },
            },
          }}
        >
          {displayItems.map((item, index) => (
            <SplideSlide key={`${(item as any).id || (item as any).href || index}-${index}`}>
              <Card item={item} itemType={itemType} rank={isTop10 ? index + 1 : undefined} />
            </SplideSlide>
          ))}
        </Splide>
      )}
    </nav>
  )
}
