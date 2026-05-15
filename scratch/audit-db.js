async function auditDatabase() {
  const supabaseUrl = "https://dusxoadqjzivjgcwlmun.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1c3hvYWRxanppdmpnY3dsbXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzMwMzUsImV4cCI6MjA5MzgwOTAzNX0.F5dFhpCv21W4WYpBjxdwueP3Wg8C67WEBiQ1Zr42eyQ";
  
  console.log("--- AUDIT DATABASE START ---");
  
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/posts?select=slug,title,created_at&type=eq.Bot%20History&order=created_at.desc&limit=50`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    const data = await res.json();
    
    console.log("Recent History Entries (Last 50):");
    const slugCounts = {};
    data.forEach(d => {
      console.log(`[${d.created_at}] [${d.slug}] - ${d.title}`);
      slugCounts[d.slug] = (slugCounts[d.slug] || 0) + 1;
    });

    console.log("\n--- DUPLICATE ANALYSIS ---");
    let duplicateCount = 0;
    Object.keys(slugCounts).forEach(slug => {
      if (slugCounts[slug] > 1) {
        console.log(`⚠️ CRITICAL: Slug "${slug}" muncul ${slugCounts[slug]} kali!`);
        duplicateCount++;
      }
    });

    if (duplicateCount === 0) {
      console.log("✅ Tidak ditemukan slug yang kembar di database. Masalah mungkin di pemicu (Trigger).");
    }
  } catch (e) {
    console.error("Audit failed:", e.message);
  }
}

auditDatabase();
