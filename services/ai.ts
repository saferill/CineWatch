import { getTrending } from "@/app/lib/tmdb";

export interface AISuggestion {
  suggestion: string;
  messageToUser: string;
  recommendations?: { id: number; title: string; type: 'movie' | 'tv' }[];
}

const ROUTER_ENDPOINT = process.env.AI_ROUTER_URL || 'https://api.9router.com/v1/chat/completions'; // Default to cloud if env not set
const ROUTER_KEY = process.env.AI_ROUTER_KEY || 'sk-3b8bb76c31c5d9f6-ou98nq-8db2a0be';

const NVIDIA_ENDPOINT = (process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1') + '/chat/completions';
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

export async function askAI(prompt: string, json: boolean = true, model?: string): Promise<any> {
  // 1. Try NVIDIA first (Production Reliable)
  if (NVIDIA_KEY) {
    try {
      console.log('AI: Attempting NVIDIA API...');
      const res = await fetch(NVIDIA_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NVIDIA_KEY}`
        },
        body: JSON.stringify({
          model: model || 'meta/llama-3.3-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          response_format: json ? { type: 'json_object' } : undefined,
          stream: false
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices[0].message.content;
        return json ? JSON.parse(content) : content;
      }
      console.warn('AI: NVIDIA API returned status', res.status);
    } catch (error) {
      console.warn('AI: NVIDIA API Error:', error);
    }
  }

  // 2. Fallback to 9Router (Local or Cloud)
  try {
    console.log('AI: Attempting 9Router/Fallback...');
    const endpoint = process.env.NODE_ENV === 'production' 
      ? (process.env.AI_ROUTER_URL || 'https://api.9router.com/v1/chat/completions')
      : 'http://localhost:20128/v1/chat/completions';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ROUTER_KEY}`
      },
      body: JSON.stringify({
        model: model || 'gemini/gemini-2.0-flash-exp',
        messages: [{ role: 'user', content: prompt }],
        response_format: json ? { type: 'json_object' } : undefined,
        stream: false
      }),
    });

    if (!res.ok) throw new Error(`AI Service Unavailable: ${res.status}`);

    const data = await res.json();
    const content = data.choices[0].message.content;
    
    return json ? JSON.parse(content) : content;
  } catch (error) {
    console.error('AI: All AI Services Failed:', error);
    return null;
  }
}

/**
 * Specifically for ChatDev style Multi-Agent workflows
 */
export async function chatWithAgent(role: string, prompt: string, style?: string): Promise<string> {
  const systemPrompt = `You are a professional member of the CineWatch ChatDev Team. Role: ${role}. Style Strategy: ${style || 'Cinematic & Professional'}. Always respond in Bahasa Indonesia.`;
  
  // Try NVIDIA first
  if (NVIDIA_KEY) {
    try {
      const res = await fetch(NVIDIA_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NVIDIA_KEY}`
        },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          stream: false
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.warn('AI: Agent NVIDIA Error', e);
    }
  }

  // Fallback to Router
  try {
    const endpoint = process.env.NODE_ENV === 'production' 
      ? (process.env.AI_ROUTER_URL || 'https://api.9router.com/v1/chat/completions')
      : 'http://localhost:20128/v1/chat/completions';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ROUTER_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini/gemini-2.0-flash-exp',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        stream: false
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices[0].message.content;
    }
  } catch (e) {
    console.error('AI: Agent Router Error', e);
  }

  return "Maaf, sistem AI sedang mengalami gangguan. Silakan coba lagi nanti.";
}

export async function askAIStream(prompt: string): Promise<Response | null> {
  // 1. Try NVIDIA first
  if (NVIDIA_KEY) {
    try {
      const res = await fetch(NVIDIA_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NVIDIA_KEY}`
        },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          stream: true
        }),
      });

      if (res.ok) return res;
    } catch (error) {
      console.warn('AI: NVIDIA Stream Error, falling back:', error);
    }
  }

  // 2. Fallback to Router
  try {
    const endpoint = process.env.NODE_ENV === 'production' 
      ? (process.env.AI_ROUTER_URL || 'https://api.9router.com/v1/chat/completions')
      : 'http://localhost:20128/v1/chat/completions';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ROUTER_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini/gemini-2.0-flash-exp',
        messages: [{ role: 'user', content: prompt }],
        stream: true
      }),
    });

    if (res.ok) return res;
  } catch (error) {
    console.error('AI: All Stream Services Failed:', error);
  }

  return null;
}


export async function getSmartRecommendations(history: any[]) {
  const titles = history.map(h => h.title).join(', ');
  const prompt = `User has watched: ${titles}. Based on this, suggest 5 similar movies or shows. Provide JSON format: { "recommendations": [{ "title": "...", "reason": "..." }] }`;
  return askAI(prompt);
}

export async function analyzeSearchQuery(query: string) {
  const trending = await getTrending().catch(() => []);
  const trendingTitles = trending.slice(0, 5).map(m => m.title).join(', ');
  
  const prompt = `User searched for: "${query}". 
  Analyze this query for CineWatch (Year: 2026). 
  Current trending movies: ${trendingTitles}.
  Provide JSON: { "type": "...", "intent": "...", "suggestedTitles": ["..."], "message": "..." }`;
  return askAI(prompt);
}

export async function getMovieAIInsights(title: string, overview: string) {
  const prompt = `Analyze this movie: "${title}". Overview: "${overview}". Provide a catchy "Why Watch This" insight (max 150 chars) and a "Mood" (e.g. Cinematic, Thrilling, Heartbreaking). JSON: { "insight": "...", "mood": "..." }`;
  return askAI(prompt);
}

export async function getMoodBasedRecommendations(mood: string) {
  const prompt = `Recommend 5 movies/shows for a "${mood}" mood. JSON: { "recommendations": [{ "title": "...", "reason": "..." }] }`;
  return askAI(prompt);
}

export async function getBlogSummary(content: string) {
  const prompt = `Summarize this blog post content into 3 concise bullet points. JSON: { "summary": ["...", "...", "..."] }`;
  return askAI(prompt);
}

/**
 * NEW: Record search queries for Trending Search Alerts
 */
export async function trackSearch(query: string) {
  if (!query) return;
  const { supabase } = await import('@/lib/supabase');
  supabase.from('search_history').insert({ query: query.toLowerCase() }).then();
}

/**
 * NEW: Analyze platform stats for milestones
 */
export async function getPlatformMilestones() {
  const { supabase } = await import('@/lib/supabase');
  
  const [users, posts, searches] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('search_history').select('id', { count: 'exact', head: true })
  ]);

  return {
    users: users.count || 0,
    posts: posts.count || 0,
    searches: searches.count || 0
  };
}
