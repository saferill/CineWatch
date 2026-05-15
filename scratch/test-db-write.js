async function testWrite() {
  const supabaseUrl = "https://dusxoadqjzivjgcwlmun.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1c3hvYWRxanppdmpnY3dsbXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMzMwMzUsImV4cCI6MjA5MzgwOTAzNX0.F5dFhpCv21W4WYpBjxdwueP3Wg8C67WEBiQ1Zr42eyQ";
  
  console.log("--- TESTING DATABASE WRITE ---");
  
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/posts`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        title: "TEST WRITE AUDIT",
        slug: `test-write-${Date.now()}`,
        type: "Bot History",
        author: "System Auditor",
        content: "Testing if database allows bot to write history."
      })
    });
    
    const data = await res.json();
    if (res.ok) {
      console.log("✅ SUCCESS: Database allows writing!", data);
    } else {
      console.error("❌ FAILED: Database rejected the write:", data);
    }
  } catch (e) {
    console.error("Critical error during write test:", e.message);
  }
}

testWrite();
