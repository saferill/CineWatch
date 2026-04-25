

export default function Loading() {
  return (
    <>
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-pulse">
        {/* Hero Skeleton */}
        <div className="w-full h-[260px] sm:h-[360px] md:h-[460px] lg:h-[540px] bg-white/[0.03] rounded-2xl border border-white/[0.05]" />
        
        {/* Row 1 Skeleton */}
        <section>
          <div className="w-32 h-6 bg-white/[0.05] rounded mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="shrink-0 w-[130px] sm:w-[150px] md:w-[160px] lg:w-[175px] aspect-[2/3] bg-white/[0.04] rounded-xl border border-white/[0.02]"
              />
            ))}
          </div>
        </section>

        {/* Row 2 Skeleton */}
        <section>
          <div className="w-48 h-6 bg-white/[0.05] rounded mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="shrink-0 w-[130px] sm:w-[150px] md:w-[160px] lg:w-[175px] aspect-[2/3] bg-white/[0.04] rounded-xl border border-white/[0.02]"
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
