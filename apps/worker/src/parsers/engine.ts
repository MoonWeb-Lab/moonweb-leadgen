import path from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { RawLead, ParserRunStats } from './types.js';
import { checkHasRealWebsite, normalizePhone } from './normalizer.js';
import { parseHolidayBy } from './sources/holidayParser.js';
import { parseOsmLeads } from './sources/osmParser.js';
import { harvestInstagramLeads } from './sources/instagramHunter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const dbPath = path.resolve(__dirname, '../../../../apps/backend/data/leadgen.sqlite');
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,
    country_id TEXT NOT NULL,
    city_id INTEGER NOT NULL,
    subcategory_id TEXT,
    name TEXT NOT NULL,
    address TEXT,
    lat REAL,
    lon REAL,
    rating REAL DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    raw_website TEXT,
    has_real_website INTEGER DEFAULT 0,
    phone_primary TEXT,
    phones_extra TEXT,
    instagram TEXT,
    telegram TEXT,
    vk TEXT,
    source TEXT NOT NULL,
    source_url TEXT,
    crm_status TEXT DEFAULT 'new',
    crm_notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const insertStmt = db.prepare(`
  INSERT INTO leads (
    external_id, country_id, city_id, subcategory_id, name, address,
    lat, lon, rating, reviews_count, raw_website, has_real_website,
    phone_primary, phones_extra, instagram, telegram, vk, source, source_url
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?
  )
  ON CONFLICT(external_id) DO UPDATE SET
    name = excluded.name,
    address = COALESCE(excluded.address, leads.address),
    phone_primary = COALESCE(excluded.phone_primary, leads.phone_primary),
    instagram = COALESCE(excluded.instagram, leads.instagram),
    telegram = COALESCE(excluded.telegram, leads.telegram),
    updated_at = CURRENT_TIMESTAMP
`);

export async function processAndSaveLeads(rawLeads: RawLead[], sourceName: string): Promise<ParserRunStats> {
  const startTime = Date.now();
  let savedNew = 0;
  let updatedExisting = 0;
  let skippedWithWebsite = 0;
  let errorsCount = 0;
  let targetLeadsWithoutWebsite = 0;

  for (const item of rawLeads) {
    try {
      const hasRealWeb = checkHasRealWebsite(item.rawWebsite);
      const isTarget = !hasRealWeb;

      if (isTarget) {
        targetLeadsWithoutWebsite++;
      } else {
        skippedWithWebsite++;
      }

      // Check if lead already exists
      const existing = db.prepare('SELECT id FROM leads WHERE external_id = ?').get(item.externalId) as { id: number } | undefined;

      insertStmt.run(
        item.externalId,
        item.countryId,
        item.cityId,
        item.subcategoryId,
        item.name,
        item.address || '',
        item.lat || null,
        item.lon || null,
        item.rating || 0,
        item.reviewsCount || 0,
        item.rawWebsite || '',
        hasRealWeb ? 1 : 0,
        normalizePhone(item.phonePrimary),
        item.phonesExtra ? JSON.stringify(item.phonesExtra) : null,
        item.instagram || '',
        item.telegram || '',
        item.vk || '',
        item.source,
        item.sourceUrl || ''
      );

      if (existing) {
        updatedExisting++;
      } else {
        savedNew++;
      }
    } catch (err: any) {
      errorsCount++;
      console.warn(`[Parser Engine] Ошибка сохранения лида ${item.name}: ${err.message}`);
    }
  }

  const durationMs = Date.now() - startTime;

  return {
    source: sourceName,
    totalFound: rawLeads.length,
    targetLeadsWithoutWebsite,
    savedNew,
    updatedExisting,
    errorsCount,
    durationMs,
  };
}

export async function runFullLeadHuntingPipeline(): Promise<void> {
  console.log('===============================================================');
  console.log('🚀 MoonWeb Lab • Запуск оптимизированного конвейера парсера');
  console.log('===============================================================');

  const overallStart = Date.now();
  const summary: ParserRunStats[] = [];

  // 1. Holiday.by: Усадьбы, Бани, Глэмпинг, Коттеджи
  console.log('\n[1/3] Запуск парсинга каталога Holiday.by...');
  const holidayEstates = await parseHolidayBy('estates', 2);
  summary.push(await processAndSaveLeads(holidayEstates, 'Holiday.by (Агроусадьбы)'));

  const holidaySaunas = await parseHolidayBy('sauna', 2);
  summary.push(await processAndSaveLeads(holidaySaunas, 'Holiday.by (Бани и сауны)'));

  // 2. OpenStreetMap Overpass: Кофейни и Салоны красоты по крупным городам
  console.log('\n[2/3] Запуск парсинга OpenStreetMap (OSM Overpass)...');
  const osmCafesMinsk = await parseOsmLeads('minsk', 'cafe', 20);
  summary.push(await processAndSaveLeads(osmCafesMinsk, 'OSM (Минск • Кофейни)'));

  const osmBarbersMinsk = await parseOsmLeads('minsk', 'hairdresser', 20);
  summary.push(await processAndSaveLeads(osmBarbersMinsk, 'OSM (Минск • Барбершопы)'));

  // 3. Instagram Hunter: поиск верифицированных бизнес-аккаунтов без сайта
  console.log('\n[3/3] Запуск сбора бизнес-аккаунтов из Instagram...');
  const instagramLeads = await harvestInstagramLeads();
  summary.push(await processAndSaveLeads(instagramLeads, 'Instagram Hunter (Верифицированные аккаунты)'));

  // 4. Вывод итоговой статистики
  const totalDurationSec = ((Date.now() - overallStart) / 1000).toFixed(1);
  const totalLeadsInDb = (db.prepare('SELECT COUNT(*) as cnt FROM leads').get() as { cnt: number }).cnt;
  const targetLeadsInDb = (db.prepare('SELECT COUNT(*) as cnt FROM leads WHERE has_real_website = 0').get() as { cnt: number }).cnt;

  console.log('\n===============================================================');
  console.log(`✨ Конвейер завершил работу за ${totalDurationSec} сек!`);
  console.log(`📊 Всего лидов в базе: ${totalLeadsInDb} (из них целевых БЕЗ САЙТА: ${targetLeadsInDb})`);
  console.log('===============================================================');

  summary.forEach(s => {
    console.log(` • ${s.source}: обработано ${s.totalFound}, без сайта: ${s.targetLeadsWithoutWebsite}, новых: ${s.savedNew}, обновлено: ${s.updatedExisting}`);
  });
}

// Allow direct CLI execution: tsx engine.ts
if (process.argv[1] && process.argv[1].endsWith('engine.ts')) {
  runFullLeadHuntingPipeline().catch(console.error);
}
