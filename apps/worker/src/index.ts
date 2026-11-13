import { runSeed } from './seeds/seedLeads.js';

console.log(`=======================================================`);
console.log(`🛠️ MoonWeb Lab • Background Worker`);
console.log(`=======================================================`);

// Ensure seed data is populated
runSeed();

console.log(`✨ Воркер готов к обработке очередей сбора данных.`);
