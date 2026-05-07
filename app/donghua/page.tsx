import React from 'react';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return (
    <section className="container mx-auto py-8 text-center">
      <h1 className="text-2xl font-bold text-white mb-6">Donghua Route Test</h1>
      <p className="text-gray-400">If you see this, the route is working.</p>
    </section>
  );
}
