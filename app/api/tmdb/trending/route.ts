import { NextResponse } from 'next/server';
import { getTrending } from '@/lib/legacy/tmdb';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const data = await getTrending();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
