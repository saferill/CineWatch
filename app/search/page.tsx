import React, { Suspense } from 'react';
import SearchClientContent from './search-client';
import { Loader2 } from 'lucide-react';

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-black pt-28 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin size-10 text-accent" />
          </div>
        }>
          <SearchClientContent />
        </Suspense>
      </div>
    </main>
  );
}
