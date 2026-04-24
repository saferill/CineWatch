"use client";

import { useState } from "react";
import { IconBrandYoutube, IconX } from "@tabler/icons-react";

export default function TrailerButton({ videoKey, title }: { videoKey: string; title?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl glass text-sm font-medium hover:bg-white/[0.08] transition-colors"
      >
        <IconBrandYoutube className="w-5 h-5 text-red-500" stroke={1.5} />
        Watch Trailer
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 p-1 text-zinc-400 hover:text-white transition-colors"
            >
              <IconX className="w-6 h-6" stroke={2} />
            </button>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
