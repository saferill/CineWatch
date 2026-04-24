"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import MovieCard from "./MovieCard";
import { IconLoader2 } from "@tabler/icons-react";

interface LoadMoreProps {
  fetchAction: (page: number) => Promise<any[]>;
  initialPage?: number;
  isTV?: boolean;
  isAnime?: boolean;
}

export default function LoadMore({ fetchAction, initialPage = 1, isTV = false, isAnime = false }: LoadMoreProps) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(initialPage + 1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  const loadMoreData = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const newData = await fetchAction(page);
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prev) => [...prev, ...newData]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error loading more:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inView) {
      loadMoreData();
    }
  }, [inView]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-6">
        {data.map((item, index) => (
          <MovieCard key={`${item.id}-${index}`} movie={item} isTV={isTV} isAnime={isAnime} />
        ))}
      </div>
      
      {hasMore && (
        <div ref={ref} className="flex justify-center py-12">
          <IconLoader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      )}
      
      {!hasMore && data.length > 0 && (
        <p className="text-center text-zinc-500 py-12 text-sm font-medium italic">
          You have reached the end of the line.
        </p>
      )}
    </>
  );
}
