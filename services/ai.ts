import { cache } from 'react'
import { getTrending } from '@/lib/legacy/tmdb'

export const analyzeSearchQuery = cache(async (query: string) => {
  const trending = await getTrending().catch(() => [])
  const trendingTitles = trending.slice(0, 5).map((m: any) => m.title).join(', ')
  const prompt = `User searched for: "${query}". Trending: ${trendingTitles}. Analyze intent and suggest 3 titles. JSON: { "type": "...", "intent": "...", "suggestedTitles": ["..."], "message": "..." }`
  return askAI(prompt)
})

export const getMovieAIInsights = cache(async (title: string, overview: string) => {
  const prompt = `Analyze movie: "${title}". Overview: "${overview}". Provide JSON: { "insight": "Why watch this (max 150 chars)", "mood": "One word mood" }`
  return askAI(prompt)
})

export async function trackSearch(query: string) {
  // tracking disabled due to supabase removal
  return
}

// ponytail: single AI provider, add fallback when needed
async function askAI(prompt: string): Promise<any> {
  const key = process.env.NVIDIA_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'meta/llama-3.3-70b-instruct',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return JSON.parse(data.choices[0].message.content)
  } catch {
    return null
  }
}
