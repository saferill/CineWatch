import { getTrending } from "@/app/lib/tmdb";

// INTERNAL OFFICE LOGGING (Live Activity Reporting)
export async function sendInternalLog(agentName: string, message: string) {
  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  if (!tgToken || !tgChatId) return;

  const icons: any = {
    'CEO': '👔',
    'Editor-in-Chief': '📝',
    'Head of Intelligence': '🕵️',
    'SEO & Growth Engineer': '📊',
    'Luxury Brand Manager': '💎',
    'Community Engagement Manager': '🤝',
    'Strategic Growth Forecaster': '🔮',
    'Luxury Personal Butler': '🤵',
    'Elite Intelligence Scout': '🚀',
    'Empathy Specialist': '✨',
    'Managing Editor': '🏢'
  };

  const icon = icons[agentName] || '🤖';
  const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formattedMsg = `${icon} <b>[${agentName.toUpperCase()}]</b> | <i>${timestamp}</i>\n\n${message}`;

  try {
    await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: tgChatId, text: formattedMsg, parse_mode: 'HTML' })
    });
  } catch (e) {
    console.error('Internal Log Error:', e);
  }
}


export interface AISuggestion {
  suggestion: string;
  messageToUser: string;
  recommendations?: { id: number; title: string; type: 'movie' | 'tv' }[];
}

const ROUTER_ENDPOINT = process.env.AI_ROUTER_URL || 'https://api.9router.com/v1/chat/completions'; // Default to cloud if env not set
const ROUTER_KEY = process.env.AI_ROUTER_KEY || 'sk-3b8bb76c31c5d9f6-ou98nq-8db2a0be';

const NVIDIA_ENDPOINT = (process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1') + '/chat/completions';
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

const YDC_KEY = process.env.YDC_API_KEY;

export async function searchYou(query: string): Promise<any> {
  if (!YDC_KEY) return null;
  
  try {
    const res = await fetch(`https://ydc-index.io/v1/search?query=${encodeURIComponent(query)}`, {
      headers: { 'X-API-Key': YDC_KEY }
    });

    if (res.ok) return await res.json();
  } catch (error) {
    console.warn('AI: You.com Search Error:', error);
  }
  return null;
}

export async function researchYou(query: string): Promise<string | null> {
  if (!YDC_KEY) return null;
  
  try {
    const res = await fetch(`https://ydc-index.io/v1/research`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': YDC_KEY 
      },
      body: JSON.stringify({ query })
    });

    if (res.ok) {
      const data = await res.json();
      return data.answer || data.content || null;
    }
  } catch (error) {
    console.warn('AI: You.com Research Error:', error);
  }
  return null;
}

export async function getYouContent(urls: string[]): Promise<any> {
  if (!YDC_KEY) return null;
  
  try {
    const res = await fetch(`https://ydc-index.io/v1/contents`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': YDC_KEY 
      },
      body: JSON.stringify({ urls })
    });

    if (res.ok) return await res.json();
  } catch (error) {
    console.warn('AI: You.com Contents Error:', error);
  }
  return null;
}

export async function askAI(prompt: string, json: boolean = true, model?: string): Promise<any> {
  console.log('AI: Using You.com Intelligence...');
  
  if (YDC_KEY) {
    try {
      const fullPrompt = json 
        ? `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object. No other text.` 
        : prompt;

      const res = await fetch(`https://ydc-index.io/v1/research`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': YDC_KEY 
        },
        body: JSON.stringify({ query: fullPrompt })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.answer || data.content;
        
        if (json) {
          try {
            // Clean JSON string from potential markdown backticks
            const cleaned = content.replace(/```json|```/g, '').trim();
            return JSON.parse(cleaned);
          } catch (e) {
            console.warn('AI: JSON Parse Error, returning raw content');
            return { error: 'Parse Error', raw: content };
          }
        }
        return content;
      }
    } catch (error) {
      console.warn('AI: You.com Research Error:', error);
    }
  }

  // FALLBACK (If YDC fails, we still have NVIDIA/9Router as absolute emergency backup, but prioritized YDC)
  if (NVIDIA_KEY) {
    try {
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
    } catch (error) {}
  }

  return null;
}

/**
 * Specifically for ChatDev style Multi-Agent workflows
 */
export async function chatWithAgent(role: string, prompt: string, style?: string): Promise<string> {
  // FETCH CORPORATE MEMORY
  let corporateMemory = "";
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: memory } = await supabase.from('posts').select('content').eq('type', 'Bot History').ilike('title', 'Corporate Memory%').order('created_at', { ascending: false }).limit(1).single();
    if (memory) corporateMemory += `\n[MEMORY]: ${memory.content}\n`;
    
    const { data: mission } = await supabase.from('posts').select('content').eq('type', 'Bot History').ilike('title', 'Weekly Vision%').order('created_at', { ascending: false }).limit(1).single();
    if (mission) corporateMemory += `\n[MISSION]: ${mission.content}\n`;
  } catch (e) {}

  const systemPrompt = `You are ${role} at CineWatch. Style: ${style || 'Cinematic'}. ${corporateMemory} Respond in Bahasa Indonesia.`;
  
  // 1. PRIMARY: YOU.COM (YDC)
  if (YDC_KEY) {
    try {
      console.log(`AI: Agent ${role} is using You.com Intelligence...`);
      const res = await fetch(`https://ydc-index.io/v1/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': YDC_KEY },
        body: JSON.stringify({ query: `${systemPrompt}\n\nUser Request: ${prompt}` })
      });

      if (res.ok) {
        const data = await res.json();
        return data.answer || data.content || "Maaf, data riset tidak ditemukan.";
      }
    } catch (e) {
      console.warn('AI: You.com Agent Error', e);
    }
  }

  // 2. EMERGENCY FALLBACK: NVIDIA
  if (NVIDIA_KEY) {
    try {
      const res = await fetch(NVIDIA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NVIDIA_KEY}` },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices[0].message.content;
      }
    } catch (e) {}
  }

  return "Maaf, sistem sedang mengalami gangguan.";

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
