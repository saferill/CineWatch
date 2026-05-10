import { getTrending } from "@/app/lib/tmdb";

export interface AISuggestion {
  suggestion: string;
  messageToUser: string;
  recommendations?: { id: number; title: string; type: 'movie' | 'tv' }[];
}

const ROUTER_ENDPOINT = 'http://localhost:20128/v1/chat/completions';
const ROUTER_KEY = 'sk-3b8bb76c31c5d9f6-ou98nq-8db2a0be';

const NVIDIA_ENDPOINT = process.env.NVIDIA_API_BASE_URL + '/chat/completions';
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

export async function askAI(prompt: string, json: boolean = true): Promise<any> {
  // Try NVIDIA first since it's more reliable
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
          response_format: json ? { type: 'json_object' } : undefined,
          stream: false
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices[0].message.content;
        return json ? JSON.parse(content) : content;
      }
    } catch (error) {
      console.warn('NVIDIA AI Error, falling back to local:', error);
    }
  }

  // Fallback to local 9Router
  try {
    const res = await fetch(ROUTER_ENDPOINT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ROUTER_KEY}`
      },
      body: JSON.stringify({
        model: 'gemini/gemini-2.0-flash-exp', // Updated model for fallback
        messages: [{ role: 'user', content: prompt }],
        response_format: json ? { type: 'json_object' } : undefined,
        stream: false
      }),
    });

    if (!res.ok) throw new Error('AI Service Unavailable');

    const data = await res.json();
    const content = data.choices[0].message.content;
    
    return json ? JSON.parse(content) : content;
  } catch (error) {
    console.error('All AI Services Failed:', error);
    return null;
  }
}

export async function askAIStream(prompt: string): Promise<Response | null> {
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
          messages: [{ role: 'user', content: prompt }],
          stream: true
        }),
      });

      if (res.ok) return res;
    } catch (error) {
      console.warn('NVIDIA Stream Error, falling back:', error);
    }
  }

  // Fallback to local
  try {
    const res = await fetch(ROUTER_ENDPOINT, {
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
    console.error('All AI Stream Services Failed:', error);
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
