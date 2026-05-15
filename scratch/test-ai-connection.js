async function testAI() {
  const nvidiaKey = "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";
  const ydcKey = "ydc-sk-077df2b555369e9c-2Gufppis9VO4iNYoYaRoFsdliilNqv2X-f089359e";

  console.log("--- TESTING NVIDIA KONEKSI ---");
  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nvidiaKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-405b-instruct",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 10
      })
    });
    const data = await res.json();
    if (res.ok) console.log("✅ NVIDIA: OK");
    else console.log("❌ NVIDIA ERROR:", data);
  } catch (e) {
    console.log("❌ NVIDIA CRITICAL:", e.message);
  }

  console.log("\n--- TESTING YOU.COM KONEKSI ---");
  try {
    const res = await fetch(`https://api.ydc-index.io/rag?query=latest+movie+news`, {
      headers: { 'X-API-Key': ydcKey }
    });
    const data = await res.json();
    if (res.ok) console.log("✅ YOU.COM: OK");
    else console.log("❌ YOU.COM ERROR:", data);
  } catch (e) {
    console.log("❌ YOU.COM CRITICAL:", e.message);
  }
}

testAI();
