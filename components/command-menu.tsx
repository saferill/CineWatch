'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { searchMovieAction } from '@/actions/search'
import { Home, Tv, Search, TrendingUp, Film, Star, ChevronRight, Bookmark, Play } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

import { MediaType } from '@/types/media'
import { SEARCH_DEBOUNCE } from '@/lib/constants'
import { cn, getPosterImageURL } from '@/lib/utils'
import { useCMDKListener } from '@/hooks/use-cmdk-listener'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandDialogProps,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Icons } from '@/components/icons'
import { Badge } from './ui/badge'

const handleUniqueTitle = (movie: MediaType, isDuplicate: boolean) => {
  if (!isDuplicate) return movie.title
  const parts: string[] = []
  if (movie.release_date) parts.push(movie.release_date.split('-')[0])
  if (movie.media_type) parts.push(movie.media_type)
  return parts.length > 0 ? `${movie.title} (${parts.join(' • ')})` : movie.title
}

export function CommandMenu({ ...props }: CommandDialogProps) {
  const { open, setOpen, runCommand, isLoading, setIsLoading } = useCMDKListener()
  const [data, setData] = React.useState<MediaType[]>([])
  const [query, setQuery] = React.useState('')
  const router = useRouter()

  const getMovieResults = async (value: string) => {
    setQuery(value)
    if (!value || value.trim() === '') {
      setData([])
      return
    }
    setIsLoading(true)
    try {
      const data = await searchMovieAction({ query: value })
      setData(data?.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedGetMovieResults = useDebouncedCallback(getMovieResults, SEARCH_DEBOUNCE)

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative h-9 w-9 p-0 sm:h-10 sm:w-full sm:justify-start sm:px-4 sm:pr-12 text-sm text-muted-foreground border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:text-white transition-all duration-300 rounded-full sm:rounded-2xl md:w-40 lg:w-64 group'
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <Search className="h-4 w-4 text-zinc-500 group-hover:text-accent transition-colors sm:mr-2" />
        <span className="hidden sm:inline-flex font-medium">Cari sesuatu...</span>
        <kbd className="pointer-events-none absolute right-2.5 top-2.5 hidden h-5 select-none items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog 
        open={open} 
        onOpenChange={setOpen} 
        className="max-w-4xl bg-zinc-950/95 backdrop-blur-2xl border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden rounded-[2rem] top-[50%] -translate-y-[50%]"
      >
        <div className="flex flex-col h-full">
          <div className="relative border-b border-white/5 px-4">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-accent" />
            <CommandInput
              placeholder="Cari film, series, atau aktor..."
              onValueChange={debouncedGetMovieResults}
              isLoading={isLoading}
              className="h-20 border-none bg-transparent pl-12 text-xl font-bold placeholder:text-zinc-700"
            />
          </div>
          
          <CommandList className="max-h-[60vh] overflow-y-auto custom-scrollbar p-4">
            <CommandEmpty className="py-24 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="size-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                   <Icons.search className="size-8 text-zinc-700" />
                </div>
                <p className="text-zinc-500 font-medium text-lg">Tidak ada hasil untuk "{query}"</p>
              </div>
            </CommandEmpty>

            {!query && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                 <CommandGroup heading="Kategori Populer">
                    <div className="space-y-1 mt-2">
                       {[
                         { icon: Film, label: 'Film Terbaru', color: 'text-blue-500', href: '/movies' },
                         { icon: Tv, label: 'TV Series Populer', color: 'text-green-500', href: '/series' },
                         { icon: TrendingUp, label: 'Sedang Trending', color: 'text-orange-500', href: '/explore' },
                         { icon: Bookmark, label: 'Daftar Tontonan', color: 'text-pink-500', href: '/watchlist' }
                       ].map((item) => (
                         <CommandItem 
                           key={item.label}
                           onSelect={() => runCommand(() => router.push(item.href))}
                           className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/5 transition-all"
                         >
                            <item.icon className={cn("size-5", item.color)} />
                            <span className="font-semibold text-sm">{item.label}</span>
                         </CommandItem>
                       ))}
                    </div>
                 </CommandGroup>
                 <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-center items-center text-center space-y-4">
                    <div className="size-16 bg-accent/20 rounded-full flex items-center justify-center border border-accent/20">
                       <Play className="size-8 text-accent fill-current" />
                    </div>
                    <h4 className="font-bold">Mau nonton apa hari ini?</h4>
                    <p className="text-xs text-zinc-500 max-w-[200px]">Temukan ribuan konten menarik hanya di CineWatch.</p>
                 </div>
              </div>
            )}

            {data.length > 0 && (
              <CommandGroup heading="Hasil Pencarian" className="[&_[cmdk-group-items]]:grid [&_[cmdk-group-items]]:grid-cols-2 [&_[cmdk-group-items]]:sm:grid-cols-3 [&_[cmdk-group-items]]:gap-4">
                {data.map((movie) => (
                  movie?.poster_path && (
                    <CommandItem
                      key={movie.id}
                      value={movie?.title || String(movie?.id)}
                      className="group relative aspect-[2/3] rounded-3xl overflow-hidden cursor-pointer border border-white/10 transition-all hover:border-accent/50 hover:scale-[1.02] p-0 data-[selected=true]:border-accent/50 data-[selected=true]:scale-[1.02] m-0"
                      onSelect={() => {
                        runCommand(() => {
                          const path = movie.media_type === 'person' ? `/person/${movie.id}` : 
                                     movie.media_type === 'tv' ? `/series/${movie.id}` : `/movie/${movie.id}`;
                          router.push(path);
                        })
                      }}
                    >
                      <img
                        src={getPosterImageURL(movie.poster_path)}
                        alt={movie.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <div className="flex items-center gap-2 mb-1">
                           <Badge className="bg-accent text-[8px] h-4 px-1 font-black">{movie.media_type}</Badge>
                           {movie.vote_average > 0 && (
                              <div className="flex items-center gap-0.5 text-[10px] font-black text-yellow-500">
                                 <Star className="size-2.5 fill-current" />
                                 {movie.vote_average.toFixed(1)}
                              </div>
                           )}
                        </div>
                        <h3 className="text-sm font-bold text-white line-clamp-1 leading-tight">{movie.title}</h3>
                        {movie.release_date && (
                           <p className="text-[10px] text-zinc-400 font-medium">{movie.release_date.split('-')[0]}</p>
                        )}
                      </div>
                    </CommandItem>
                  )
                ))}
              </CommandGroup>
            )}
          </CommandList>
          
          <div className="bg-black/50 backdrop-blur-xl border-t border-white/5 px-6 py-4 flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
             <div className="flex gap-6">
                <span className="flex items-center gap-2"><kbd className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">↑↓</kbd> Navigasi</span>
                <span className="flex items-center gap-2"><kbd className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">Enter</kbd> Pilih</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-accent/50">CineWatch Search Engine</span>
             </div>
          </div>
        </div>
      </CommandDialog>
    </>
  )
}
