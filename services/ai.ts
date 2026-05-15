import { getTrending } from "@/app/lib/tmdb";

// INTERNAL OFFICE LOGGING (Live Activity Reporting)
export async function sendInternalLog(agentName: string, message: string, silent: boolean = false) {
  const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  if (silent || !tgToken || !tgChatId) {
    console.log(`[SILENT LOG] [${agentName}]: ${message}`);
    return;
  }

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

const NVIDIA_ENDPOINT = (process.env.NVIDIA_API_BASE_URL || 'https://integrate.api.nvidia.com/v1') + '/chat/completions';
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;
const YDC_KEY = process.env.YDC_API_KEY;
const ROUTER_KEY = process.env.AI_ROUTER_KEY || 'sk-3b8bb76c31c5d9f6-ou98nq-8db2a0be';

export async function askAI(prompt: string, json: boolean = true): Promise<any> {
  // 1. TRY NVIDIA
  if (NVIDIA_KEY) {
    try {
      const res = await fetch(NVIDIA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NVIDIA_KEY}` },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          response_format: json ? { type: 'json_object' } : undefined
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.choices[0].message.content;
        return json ? JSON.parse(content) : content;
      }
    } catch (e) {}
  }

  // 2. TRY GEMINI (Fallback)
  try {
    const res = await fetch('https://api.9router.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ROUTER_KEY}` },
      body: JSON.stringify({
        model: 'gemini/gemini-2.0-flash-exp',
        messages: [{ role: 'user', content: prompt }]
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const content = data.choices[0].message.content;
      return json ? JSON.parse(content) : content;
    }
  } catch (e) {}

  return null;
}

export async function searchYou(query: string): Promise<any> {
  if (!YDC_KEY) return null;
  try {
    const res = await fetch(`https://api.ydc-index.io/search?query=${encodeURIComponent(query)}`, {
      headers: { 'X-API-Key': YDC_KEY }
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function getYouContent(urls: string[]): Promise<any> {
  if (!YDC_KEY) return null;
  try {
    const res = await fetch(`https://api.ydc-index.io/contents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': YDC_KEY },
      body: JSON.stringify({ urls })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function researchYou(query: string): Promise<string | null> {
  if (!YDC_KEY) return null;
  try {
    const res = await fetch(`https://api.ydc-index.io/rag?query=${encodeURIComponent(query)}`, {
      headers: { 'X-API-Key': YDC_KEY }
    });
    if (res.ok) {
      const data = await res.json();
      return data.answer || data.content || null;
    }
  } catch (e) {}
  return null;
}

export async function askAIStream(prompt: string): Promise<Response | null> {
  if (NVIDIA_KEY) {
    try {
      const res = await fetch(NVIDIA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NVIDIA_KEY}` },
        body: JSON.stringify({
          model: 'meta/llama-3.3-70b-instruct',
          messages: [{ role: 'user', content: prompt }],
          stream: true
        }),
      });
      if (res.ok) return res;
    } catch (e) {}
  }
  return null;
}

export async function chatWithAgent(role: string, prompt: string, style?: string): Promise<string> {
  let corporateMemory = "";
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: wisdom } = await supabase.from('posts').select('content').eq('type', 'Corporate Wisdom').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (wisdom) corporateMemory += `\n[WISDOM]: ${wisdom.content}\n`;
  } catch (e) {}

  const systemPrompt = `You are ${role} at CineWatch. Style: ${style || 'Professional'}. ${corporateMemory} Always respond in Bahasa Indonesia.`;
  
  let research = "";
  if (prompt.includes('berita') || prompt.includes('rilis')) {
    research = await researchYou(prompt) || "";
  }

  const finalPrompt = `${systemPrompt}\n\nResearch: ${research}\n\nTask: ${prompt}`;
  const result = await askAI(finalPrompt, false);

  if (result) return result;

  const fallbacks: any = {
    'Scout': 'Intelijen kami mendeteksi rilis ini sebagai prioritas tinggi. Wajib tonton segera di CineWatch!',
    'CEO': 'Misi kita adalah dominasi konten dan kualitas brand sinematik terbaik.',
    'default': 'Konten eksklusif CineWatch telah diperbarui. Selamat menikmati pengalaman sinematik premium.'
  };
  return fallbacks[role] || fallbacks['default'];
}

export async function executeWorkflow(taskName: string, initialPrompt: string): Promise<string> {
  const plan = await chatWithAgent('Project Manager', `Buat rencana: ${taskName}. ${initialPrompt}`);
  const draft = await chatWithAgent('Senior Specialist', `Eksekusi: ${plan}`, 'Detailed');
  const final = await chatWithAgent('Executive Editor', `Refine draft: ${draft}`, 'Luxury');
  return final;
}

export async function analyzeSearchQuery(query: string) {
  const trending = await getTrending().catch(() => []);
  const trendingTitles = trending.slice(0, 5).map(m => m.title).join(', ');
  const prompt = `User searched for: "${query}". Trending: ${trendingTitles}. Analyze intent and suggest 3 titles. JSON: { "type": "...", "intent": "...", "suggestedTitles": ["..."], "message": "..." }`;
  return askAI(prompt);
}

export async function getMovieAIInsights(title: string, overview: string) {
  const prompt = `Analyze movie: "${title}". Overview: "${overview}". Provide JSON: { "insight": "Why watch this (max 150 chars)", "mood": "One word mood" }`;
  return askAI(prompt);
}

export async function getBlogSummary(content: string) {
  const prompt = `Summarize blog post into 3 points. JSON: { "summary": ["...", "...", "..."] }`;
  return askAI(prompt);
}

export async function trackSearch(query: string) {
  if (!query) return;
  const { supabase } = await import('@/lib/supabase');
  supabase.from('search_history').insert({ query: query.toLowerCase() }).then();
}

export async function getPlatformMilestones() {
  const { supabase } = await import('@/lib/supabase');
  const [users, posts, searches] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('search_history').select('id', { count: 'exact', head: true })
  ]);
  return { users: users.count || 0, posts: posts.count || 0, searches: searches.count || 0 };
}
