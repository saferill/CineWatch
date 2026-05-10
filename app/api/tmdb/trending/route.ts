import { NextResponse } from 'next/server';
import { getTrending } from '@/app/lib/tmdb';

export async function GET() {
  try {
    const data = await getTrending();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
