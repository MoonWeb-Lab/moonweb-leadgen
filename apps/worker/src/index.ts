import { runSeed } from './seeds/seedLeads.js';
import { runFullLeadHuntingPipeline } from './parsers/engine.js';
import { syncDatabaseToStaticLeads } from './parsers/syncToStatic.js';

console.log(`=======================================================`);
console.log(`🛠️ MoonWeb Lab • Lead Hunter & Background Worker`);
console.log(`=======================================================`);

async function main() {
  // 1. Run seeds if DB is empty
  await runSeed();

  // 2. Run full parsing pipeline
  await runFullLeadHuntingPipeline();

  // 3. Sync database to staticLeads for client-side webapp
  syncDatabaseToStaticLeads();

  console.log(`✨ Воркер и парсер успешно завершили цикл сбора данных.`);
}

main().catch(console.error);
