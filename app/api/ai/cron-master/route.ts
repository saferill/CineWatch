import { NextResponse } from 'next/server';

// Import the logic or just fetch the internal APIs
async function triggerTask(path: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cinewatch.vercel.app';
  const baseUrl = process.env.NODE_ENV === 'production' ? siteUrl : 'http://localhost:3000';
  
  try {
    console.log(`CRON-MASTER: Triggering ${path}...`);
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error(`CRON-MASTER ERROR [${path}]:`, err.message);
    return { error: err.message };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const querySecret = searchParams.get('secret');
  const forcedTask = searchParams.get('task');
  
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // 1. Authorization Check (Header or Query Param)
  const isAuthorized = (cronSecret && (authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret));
  
  if (!isAuthorized && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDay();
  
  const results: any = {};

  // 2. Task Triggering Logic
  const runTask = async (name: string, path: string) => {
    results[name] = await triggerTask(path);
  };

  // Manual Trigger via ?task=...
  if (forcedTask) {
    console.log(`CRON-MASTER: Manual trigger for task: ${forcedTask}`);
    await runTask(forcedTask, `/api/ai/${forcedTask}`);
  } else {
    // Standard Time-based Logic
    console.log(`CRON-MASTER: Running at ${now.toISOString()} (Hour: ${hour}, Day: ${day})`);

    // Blog generation (05:00 UTC)
    if (hour === 5) await runTask('blog', '/api/ai/generate-news');

    // Release Alerts (00:00 & 12:00 UTC)
    if (hour === 0 || hour === 12) await runTask('releases', '/api/ai/release-alert');

    // Admin Intel (08:00 UTC)
    if (hour === 8) await runTask('intel', '/api/ai/admin-intel');

    // Weekly Hype (Monday 09:00 UTC)
    if (hour === 9 && day === 1) await runTask('weekly', '/api/ai/weekly-hype');

    // Health Check (Every 4 hours)
    if (hour % 4 === 0) await runTask('health', '/api/ai/health-check');

    // Release Sync (01:00 UTC)
    if (hour === 1) await runTask('sync', '/api/cron/release-sync');
  }

  return NextResponse.json({
    status: 'Cron Master Executed',
    time: now.toISOString(),
    mode: forcedTask ? 'Manual' : 'Scheduled',
    tasks_triggered: Object.keys(results),
    details: results
  });
}


