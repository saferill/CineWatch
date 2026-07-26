'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function SpaRouter() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get('p');
    if (redirectPath) {
      const cleanPath = redirectPath.replace(/~and~/g, '&');
      const basePath = process.env.NODE_ENV === 'production' ? '/CineWatch' : '';
      window.history.replaceState(null, '', basePath + '/' + cleanPath);
      router.replace('/' + cleanPath);
    }
  }, [router]);

  return null;
}
