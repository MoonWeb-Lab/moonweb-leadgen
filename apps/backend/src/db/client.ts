import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { config } from '../config.js';
import { COUNTRIES, CITIES, CATEGORIES, SUBCATEGORIES } from './catalogData.js';

// Ensure data directory exists
const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(config.dbPath);

export function initDatabase() {
  // Enable high-performance WAL journaling
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  // 1. Countries
  db.exec(`
    CREATE TABLE IF NOT EXISTS countries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      flag TEXT NOT NULL
    );
  `);

  // 2. Cities
  db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY,
      country_id TEXT NOT NULL REFERENCES countries(id),
      name TEXT NOT NULL,
      region TEXT,
      is_major INTEGER DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country_id, is_major);
  `);

  // 3. Categories & Subcategories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL REFERENCES categories(id),
      name TEXT NOT NULL,
      search_queries TEXT NOT NULL
    );
  `);

  // 4. Leads Master Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT UNIQUE,
      country_id TEXT NOT NULL REFERENCES countries(id),
      city_id INTEGER NOT NULL REFERENCES cities(id),
      subcategory_id TEXT REFERENCES subcategories(id),
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

    CREATE INDEX IF NOT EXISTS idx_leads_filter ON leads(country_id, city_id, has_real_website, rating);
    CREATE INDEX IF NOT EXISTS idx_leads_subcat ON leads(subcategory_id);
    CREATE INDEX IF NOT EXISTS idx_leads_crm ON leads(crm_status);
    CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone_primary);
  `);

  // Seed Catalog if empty
  seedCatalog();
}

function seedCatalog() {
  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM countries').get() as { cnt: number };
  if (countRow && countRow.cnt > 0) return;

  console.log('🌱 Наполнение каталога стран, городов и ниш...');

  // Countries
  const insertCountry = db.prepare('INSERT OR REPLACE INTO countries (id, name, flag) VALUES (?, ?, ?)');
  COUNTRIES.forEach(c => insertCountry.run(c.id, c.name, c.flag));

  // Cities
  const insertCity = db.prepare('INSERT OR REPLACE INTO cities (id, country_id, name, region, is_major) VALUES (?, ?, ?, ?, ?)');
  CITIES.forEach(c => insertCity.run(c.id, c.countryId, c.name, c.region || null, c.isMajor));

  // Categories
  const insertCat = db.prepare('INSERT OR REPLACE INTO categories (id, name, emoji, sort_order) VALUES (?, ?, ?, ?)');
  CATEGORIES.forEach(c => insertCat.run(c.id, c.name, c.emoji, c.sortOrder));

  // Subcategories
  const insertSub = db.prepare('INSERT OR REPLACE INTO subcategories (id, category_id, name, search_queries) VALUES (?, ?, ?, ?)');
  SUBCATEGORIES.forEach(s => insertSub.run(s.id, s.categoryId, s.name, JSON.stringify(s.searchQueries)));

  console.log('✅ Справочник ниш и локаций успешно инициализирован.');
}
