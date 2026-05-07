import type { DonghuaHomeResponse } from '@/types/donghua';

/**
 * Fetch home data (latest releases and completed donghua) from Moli API.
 */
export async function fetchDonghuaHome(): Promise<DonghuaHomeResponse> {
  const baseUrl = process.env.MOLI_API_URL;
  if (!baseUrl) {
    throw new Error('MOLI_API_URL is not defined in environment variables');
  }
  const res = await fetch(`${baseUrl}/home/1`);
  if (!res.ok) {
    throw new Error(`Moli API error: ${res.status}`);
  }
  const json = await res.json();
  
  // Mapping API response to our expected type
  const recent = (json.latest_release || []).map((item: any) => ({
    title: item.title,
    poster: item.poster,
    episodes: (item.current_episode || '??').replace(/Ep\s*/i, '').trim(),
    releasedOn: 'Baru',
    href: `/donghua/${item.slug}`,
  }));

  const completed = (json.completed_donghua || []).map((item: any) => ({
    title: item.title,
    poster: item.poster,
    episodes: 'END',
    releasedOn: 'Tamat',
    href: `/donghua/${item.slug}`,
  }));

  return { recent, completed };
}
