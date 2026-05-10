import { NextResponse } from 'next/server';

// Import the logic or just fetch the internal APIs
// Fetching internal APIs is safer for timeouts on Vercel
async function triggerTask(path: string) {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
    });
    return await res.json();
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // For local testing or Vercel trigger, skip if no secret but check Vercel source
  }

  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDay(); // 0 = Sunday, 1 = Monday
  
  const results: any = {};

  // 1. Daily Blog (05:00 UTC)
  if (hour === 5) {
    results.blog = await triggerTask('/api/ai/generate-news');
  }

  // 2. Release Alerts (00:00 & 12:00 UTC)
  if (hour === 0 || hour === 12) {
    results.releases = await triggerTask('/api/ai/release-alert');
  }

  // 3. Admin Intel (08:00 UTC)
  if (hour === 8) {
    results.intel = await triggerTask('/api/ai/admin-intel');
  }

  // 4. Weekly Hype (Monday 09:00 UTC)
  if (hour === 9 && day === 1) {
    results.weekly = await triggerTask('/api/ai/weekly-hype');
  }

  // 5. Health Check (Every 4 hours: 0, 4, 8, 12, 16, 20)
  if (hour % 4 === 0) {
    results.health = await triggerTask('/api/ai/health-check');
  }

  return NextResponse.json({
    status: 'Cron Master Executed',
    time: now.toISOString(),
    tasks_triggered: Object.keys(results),
    details: results
  });
}
