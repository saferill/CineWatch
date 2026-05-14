import { searchYou } from '../services/ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  const query = process.argv[2] || "Avatar 3 release date";
  console.log(`\n🚀 CINEWATCH INTEL SEARCH TEST`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔎 Query: "${query}"\n`);
  
  try {
    const results = await searchYou(query);
    
    if (results && results.hits && results.hits.length > 0) {
      results.hits.slice(0, 5).forEach((hit: any, i: number) => {
        console.log(`[${i + 1}] ${hit.title}`);
        console.log(`    🔗 ${hit.url}`);
        console.log(`    📝 ${hit.snippet}\n`);
      });
      console.log(`✅ Berhasil menarik ${results.hits.length} data intel.`);
    } else {
      console.log("❌ Tidak ada hasil. Cek YDC_API_KEY di .env.local.");
      console.log("Response:", JSON.stringify(results, null, 2));
    }
  } catch (error) {
    console.error("🔥 Error saat testing:", error);
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

test();
