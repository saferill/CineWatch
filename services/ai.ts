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
  // 1. TRY NVIDIA (Fast & Powerful)
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

  // 2. TRY GEMINI 2.0 (The Smart Backup)
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

export async function chatWithAgent(role: string, prompt: string, style?: string): Promise<string> {
  let corporateMemory = "";
  try {
    const { supabase } = await import('@/lib/supabase');
    const { data: wisdom } = await supabase.from('posts').select('content').eq('type', 'Corporate Wisdom').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (wisdom) corporateMemory += `\n[WISDOM]: ${wisdom.content}\n`;
  } catch (e) {}

  const systemPrompt = `You are ${role} at CineWatch. Style: ${style || 'Professional'}. ${corporateMemory} Always respond in Bahasa Indonesia.`;
  
  // 1. Research if needed
  let research = "";
  if (prompt.includes('berita') || prompt.includes('rilis')) {
    research = await researchYou(prompt) || "";
  }

  // 2. Ask AI (NVIDIA -> GEMINI Fallback)
  const finalPrompt = `${systemPrompt}\n\nResearch: ${research}\n\nTask: ${prompt}`;
  const result = await askAI(finalPrompt, false);

  if (result) return result;

  // 3. STATIC EMERGENCY FALLBACK
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
