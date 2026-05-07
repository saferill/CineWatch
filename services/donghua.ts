import type { 
  DonghuaHomeResponse, 
  DonghuaDetail, 
  DonghuaEpisode 
} from '@/types/donghua';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0',
};

// Use a fallback URL if the environment variable is missing
const BASE_URL = process.env.MOLI_API_URL || 'https://www.sankavollerei.com/anime/donghua';

async function moliFetch(path: string) {
  const baseUrl = BASE_URL.replace(/\/$/, '');
  
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;
  
  console.log(`Fetching Donghua API: ${url}`);
  
  try {
    const res = await fetch(url, { 
      headers: HEADERS,
      cache: 'no-store' // Disable caching to ensure fresh data
    });
    
    if (!res.ok) {
      throw new Error(`Moli API error: ${res.status} at ${url}`);
    }
    
    const json = await res.json();
    
    if (json.error || json.status === 'error') {
      throw new Error(json.message || json.error || 'Internal API Error');
    }
    
    return json.data || json;
  } catch (err) {
    console.error(`Fetch failed for ${url}:`, err);
    throw err;
  }
}

export async function fetchDonghuaHome(): Promise<DonghuaHomeResponse> {
  try {
    const data = await moliFetch('/home/1');
    
    const recent = (data.latest_release || []).map((item: any) => ({
      title: item.title || 'Untitled',
      poster: item.poster || '',
      episodes: (item.current_episode || '??').replace(/Ep\s*/i, '').trim(),
      releasedOn: 'Baru',
      href: `/donghua/episode/${(item.slug || '').replace(/\/$/, '')}`,
    }));

    const completed = (data.completed_donghua || []).map((item: any) => ({
      title: item.title || 'Untitled',
      poster: item.poster || '',
      episodes: 'END',
      releasedOn: 'Tamat',
      href: `/donghua/detail/${(item.slug || '').replace(/\/$/, '').replace(/-episode-\d+.*$/, '')}`,
    }));

    return { recent, completed };
  } catch (error) {
    console.error('fetchDonghuaHome error:', error);
    return { recent: [], completed: [] };
  }
}

export async function fetchDonghuaDetail(slug: string): Promise<DonghuaDetail> {
  const cleanSlug = slug.replace(/\/$/, '');
  const data = await moliFetch(`/detail/${cleanSlug}`);
  
  return {
    title: data.title || 'Unknown Title',
    alterTitle: data.alter_title || '',
    poster: data.poster || '',
    rating: data.rating || 'N/A',
    studio: data.studio || '-',
    released: data.released || '-',
    duration: data.duration || '-',
    episodesCount: data.episodes_count || '-',
    season: data.season || '-',
    type: data.type || '-',
    status: data.status || 'Unknown',
    genres: (data.genres || []).map((g: any) => ({ 
      name: typeof g === 'string' ? g : (g.name || 'Genre'), 
      slug: g.slug || '#' 
    })),
    synopsis: data.synopsis || '',
    episodesList: (data.episodes_list || []).map((e: any) => ({
      title: e.episode || 'Episode',
      slug: (e.slug || '').replace(/\/$/, '')
    })).reverse()
  };
}

export async function fetchDonghuaEpisode(slug: string): Promise<DonghuaEpisode> {
  const cleanSlug = slug.replace(/\/$/, '');
  const data = await moliFetch(`/episode/${cleanSlug}`);

  return {
    title: data.episode || 'Episode',
    streamingUrl: data.streaming?.main_url?.url || data.streaming?.servers?.[0]?.url || "",
    servers: (data.streaming?.servers || []).map((s: any) => ({
      name: s.name || 'Server',
      url: s.url || ''
    })),
    donghua: {
      title: data.donghua_details?.title || 'Unknown',
      slug: (data.donghua_details?.slug || '').replace(/\/$/, ''),
      poster: data.donghua_details?.poster || '',
    },
    navigation: {
      prev: data.navigation?.previous_episode ? {
        slug: data.navigation.previous_episode.slug.replace(/\/$/, ''),
        title: data.navigation.previous_episode.episode
      } : undefined,
      next: data.navigation?.next_episode ? {
        slug: data.navigation.next_episode.slug.replace(/\/$/, ''),
        title: data.navigation.next_episode.episode
      } : undefined,
    }
  };
}
