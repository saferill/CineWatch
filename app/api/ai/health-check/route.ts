import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const issues: string[] = [];
  const startTime = Date.now();

  try {
    // 1. Check TMDB
    const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/550?api_key=${process.env.TMDB_API_KEY}`);
    if (!tmdbRes.ok) issues.push(`❌ TMDB API: Error ${tmdbRes.status}`);

    // 2. Check Supabase
    const { error: sbError } = await supabase.from('posts').select('id').limit(1);
    if (sbError) issues.push(`❌ Supabase DB: ${sbError.message}`);

    // 3. Check AI Engine (NVIDIA or Router)
    const aiEndpoint = process.env.NODE_ENV === 'production' 
      ? (process.env.AI_ROUTER_URL || 'https://api.9router.com/v1/models')
      : 'http://localhost:20128/v1/models';
    
    const aiRes = await fetch(aiEndpoint, {
      headers: { 'Authorization': `Bearer ${process.env.AI_ROUTER_KEY || 'sk-3b8bb76c31c5d9f6-ou98nq-8db2a0be'}` }
    }).catch(() => null);
    
    if (!aiRes || !aiRes.ok) {
      // If router is down, check NVIDIA as backup
      const nvRes = await fetch('https://integrate.api.nvidia.com/v1/models', {
        headers: { 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}` }
      }).catch(() => null);
      if (!nvRes || !nvRes.ok) issues.push(`❌ AI Engine: Both Router and NVIDIA Unavailable`);
    }

    const duration = Date.now() - startTime;

    // 4. Alert if issues found
    if (issues.length > 0) {
      const discordUrl = process.env.DISCORD_RELEASE_WEBHOOK_URL;
      const tgToken = process.env.TELEGRAM_NOTIF_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
      const tgChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

      const alertMsg = `🚨 *SYSTEM HEALTH ALERT!*\n\nMasalah ditemukan:\n${issues.join('\n')}\n\n⏱️ Latency: ${duration}ms\n📅 Waktu: ${new Date().toLocaleString()}`;

      if (tgToken && tgChatId) {
        await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: tgChatId, text: alertMsg, parse_mode: 'Markdown' })
        }).catch(() => {});
      }

      if (discordUrl) {
        await fetch(discordUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: "🚨 SYSTEM HEALTH ALERT",
              description: alertMsg.replace(/\*/g, '**'),
              color: 0xFF4500,
              footer: { text: "CineWatch Sentinel Watchdog" }
            }]
          })
        }).catch(() => {});
      }
    }

    return NextResponse.json({ 
      status: issues.length === 0 ? 'Healthy' : 'Degraded',
      latency: `${duration}ms`,
      issues 
    });

  } catch (error: any) {
    return NextResponse.json({ status: 'Critical Error', error: error.message }, { status: 500 });
  }
}
