import { NextResponse } from 'next/server';
import { sendInternalLog } from '@/services/ai';

// Import the logic or just fetch the internal APIs
async function triggerTask(path: string, request: Request) {
  // 1. Determine Base URL dynamically
  const host = request.headers.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const dynamicBase = `${protocol}://${host}`;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || dynamicBase;
  
  try {
    console.log(`CRON-MASTER: Triggering ${siteUrl}${path}...`);
    const res = await fetch(`${siteUrl}${path}`, {
      headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
    });
    
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    } else {
      const text = await res.text();
      return { error: `Expected JSON but got ${contentType}`, preview: text.slice(0, 100) };
    }
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
  
  // 1. Authorization Check
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
    results[name] = await triggerTask(path, req);
  };

  // Manual Trigger via ?task=...
  if (forcedTask) {
    console.log(`CRON-MASTER: Manual trigger for task: ${forcedTask}`);
    // Map manual task names to correct paths
    const taskPaths: any = {
      'blog': '/api/ai/generate-news',
      'releases': '/api/ai/release-alert',
      'intel': '/api/ai/admin-intel',
      'weekly': '/api/ai/weekly-hype',
      'health': '/api/ai/health-check',
      'sync': '/api/cron/release-sync',
      'mood': '/api/ai/mood-recommendation',
      'digest': '/api/ai/editorial-digest',
      'search-hype': '/api/ai/search-hype',
      'milestones': '/api/ai/milestones',
      'channel-filler': '/api/ai/channel-filler',
      'office-pulse': 'INTERNAL_PULSE'
    };
    
    if (forcedTask === 'office-pulse') {
      await runOfficePulse();
      return NextResponse.json({ success: true, message: 'Office pulse sent' });
    }
    
    const targetPath = taskPaths[forcedTask] || `/api/ai/${forcedTask}`;
    await runTask(forcedTask, targetPath);
  } else {
    // Standard Time-based Logic
    console.log(`CRON-MASTER: Running at ${now.toISOString()} (Hour: ${hour}, Day: ${day})`);

    // 11. Dual-Channel Filler (Setiap 6 Jam)
    if (hour % 6 === 0) {
      await runTask('channel-filler-main', '/api/ai/channel-filler?type=main');
      await runTask('channel-filler-anime', '/api/ai/channel-filler?type=anime');
    }

    // 2. Real-Time Release Pulse (Setiap 4 Jam - Sesuai Request User)
    if (hour % 4 === 0) {
      await runTask('release-pulse', '/api/ai/release-alert');
    }

    // --- REDAKSI NEWSROOM SCHEDULE (WIB Based) ---
    // 1. Movie Spotlight (02:00 UTC / 09:00 WIB)
    if (hour === 2) await runTask('blog-movie', '/api/ai/generate-news?category=movie');

    // 2. Series Spotlight (05:00 UTC / 12:00 WIB)
    if (hour === 5) await runTask('blog-series', '/api/ai/generate-news?category=series');

    // 3. Anime Spotlight (08:00 UTC / 15:00 WIB)
    if (hour === 8) await runTask('blog-anime', '/api/ai/generate-news?category=anime');

    // 4. Donghua Spotlight (11:00 UTC / 18:00 WIB)
    if (hour === 11) await runTask('blog-donghua', '/api/ai/generate-news?category=donghua');

    // 5. Admin Intel (03:00 UTC)
    if (hour === 3) await runTask('intel', '/api/ai/admin-intel');
    // 11. Global News Sentry (Every hour)
    await runTask('sentry', '/api/ai/news-sentry');
    // 6. Weekly Hype (Monday 09:00 UTC)
    if (hour === 9 && day === 1) await runTask('weekly', '/api/ai/weekly-hype');

    // 7. Editorial Digest (Sunday 10:00 UTC)
    if (hour === 10 && day === 0) await runTask('digest', '/api/ai/editorial-digest');

    // 7. Search Hype (Daily 14:00 UTC / 21:00 WIB)
    if (hour === 14) await runTask('search-hype', '/api/ai/search-hype');

    // 8. Milestones (Saturday 11:00 UTC / 18:00 WIB)
    if (hour === 11 && day === 6) await runTask('milestones', '/api/ai/milestones');

    // 9. Tech Audit (Every 4 hours)
    if (hour % 4 === 0) {
      await runTask('tech-audit', '/api/ai/tech-audit');
    }

    // 10. Hourly Executive Report (Consolidated Notifications - ONCE PER HOUR)
    await runTask('hourly-report', '/api/ai/hourly-report');

    // 11. Live Office Pulse & Life Story (Every hour - SILENT)
    await runTask('office-life', '/api/ai/office-life?silent=true');
    if (hour % 6 === 0) await runOfficePulse();
    
    // 11. Autonomous Evolution & Training (Every 12 hours)
    if (hour % 12 === 0) await runTask('academy-training', '/api/ai/training');

    // 10. Release Sync (01:00 UTC)
    if (hour === 1) await runTask('sync', '/api/cron/release-sync');
  }

  // GLOBAL ERROR REPORTING: Jika ada tugas yang gagal, staf lapor ke Boss
  const failedTasks = Object.entries(results).filter(([_, res]) => (res as any).error);
  if (failedTasks.length > 0) {
    for (const [taskName, res] of failedTasks) {
      await sendInternalLog('Elite Intelligence Scout', `⚠️ BOSS! SAYA LAPOR: Staf di bagian [${taskName}] sedang mengalami kendala teknis.\nDetail: ${(res as any).error}\n\nMohon dicek kembali, Boss!`);
    }
  }



  return NextResponse.json({
    status: 'Cron Master Executed',
    time: now.toISOString(),
    mode: forcedTask ? 'Manual' : 'Scheduled',
    tasks_triggered: Object.keys(results),
    details: results
  });
}

async function runOfficePulse() {
  const updates = [
    { agent: 'CEO', msg: 'Sedang mereview laporan performa mingguan. Standar kita harus tetap nomor satu.' },
    { agent: 'Head of Intelligence', msg: 'Mendeteksi pergerakan menarik di server rilis global. Sedang memverifikasi data.' },
    { agent: 'SEO & Growth Engineer', msg: 'Optimasi metadata sedang berjalan. Kita menargetkan posisi #1 di Google hari ini.' },
    { agent: 'Luxury Brand Manager', msg: 'Memastikan semua narasi tetap elegan. Kita menjual kemewahan, bukan sekadar berita.' },
    { agent: 'Elite Intelligence Scout', msg: 'Menyisir database rilis 2026. Menemukan beberapa judul yang potensial viral.' },
    { agent: 'Managing Editor', msg: 'Koordinasi tim penulis selesai. Semua draf sedang dalam proses kurasi ketat.' },
    { agent: 'Empathy Specialist', msg: 'Menganalisis tren mood user malam ini. Rekomendasi sedang disiapkan.' },
    { agent: 'Legal Officer', msg: 'Melakukan audit kepatuhan konten. Kita harus tetap aman dari sisi hukum.' },
    { agent: 'QA Ruthless Critic', msg: 'Draf artikel ini sampah! Saya sudah memberikan 10 catatan perbaikan untuk tim penulis.' },
    { agent: 'Viral Growth Strategist', msg: 'Menganalisis algoritma TikTok malam ini. Konten kita berikutnya harus meledak!' }
  ];

  const random = updates[Math.floor(Math.random() * updates.length)];
  await sendInternalLog(random.agent, random.msg);
}


