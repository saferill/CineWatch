"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IconMovie, IconArrowRight } from "@tabler/icons-react";

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has already seen onboarding in this session
    const hasOnboarded = sessionStorage.getItem("cinewatch_onboarded");
    if (!hasOnboarded) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const handleStart = () => {
    setIsClosing(true);
    setTimeout(() => {
      sessionStorage.setItem("cinewatch_onboarded", "true");
      setShow(false);
    }, 600); // Matches the fade-out duration
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-700 ease-in-out ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background elegant gradient/noise */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
      <div className="absolute inset-0 noise opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl px-6">
        <div className="mb-10 animate-fade-up">
          <Image 
            src="/logo.png" 
            alt="CineWatch Logo" 
            width={240} 
            height={80} 
            className="h-16 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            priority
          />
        </div>

        {/* Typography */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 opacity-0"
          style={{ animation: "fade-up 0.8s ease forwards 0.2s" }}
        >
          Welcome to <br className="sm:hidden" />
          <span className="text-gradient-accent">CineWatch</span>
        </h1>

        <p
          className="text-zinc-400 text-lg sm:text-xl font-medium mb-12 max-w-lg opacity-0"
          style={{ animation: "fade-up 0.8s ease forwards 0.4s" }}
        >
          Your premium destination for discovering and streaming movies, series,
          and anime in unparalleled elegance.
        </p>

        {/* Call to Action */}
        <button
          onClick={handleStart}
          className="group relative flex items-center gap-3 h-14 pl-8 pr-6 rounded-2xl bg-white text-black font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] opacity-0"
          style={{ animation: "fade-up 0.8s ease forwards 0.6s" }}
        >
          Get Started
          <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
            <IconArrowRight className="w-4 h-4" stroke={2.5} />
          </div>
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
