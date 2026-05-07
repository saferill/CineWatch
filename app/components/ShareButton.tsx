"use client";

import { IconShare } from "@tabler/icons-react";
import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `CineWatch - ${title}`,
      text: `Check out ${title} on CineWatch!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center w-12 h-12 rounded-xl glass hover:bg-white/[0.08] transition-all duration-200 group relative"
      title="Share"
    >
      <IconShare className="w-5 h-5 text-zinc-400 group-hover:text-white" stroke={1.5} />
      {copied && (
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-white text-black text-[10px] font-bold rounded shadow-lg animate-fade-up">
          Link Copied!
        </span>
      )}
    </button>
  );
}
