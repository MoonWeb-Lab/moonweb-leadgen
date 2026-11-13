import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';

export async function catalogRoutes(fastify: FastifyInstance) {
  // Get all countries
  fastify.get('/catalog/countries', async () => {
    return db.prepare('SELECT * FROM countries ORDER BY name ASC').all();
  });

  // Get cities (optionally filtered by country)
  fastify.get('/catalog/cities', async (request) => {
    const { countryId } = request.query as { countryId?: string };
    if (countryId) {
      return db.prepare('SELECT * FROM cities WHERE country_id = ? ORDER BY is_major DESC, name ASC').all(countryId);
    }
    return db.prepare('SELECT * FROM cities ORDER BY is_major DESC, name ASC').all();
  });

  // Get categories with their subcategories
  fastify.get('/catalog/categories', async () => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all() as any[];
    const subcategories = db.prepare('SELECT * FROM subcategories').all() as any[];

    return categories.map(cat => ({
      ...cat,
      subcategories: subcategories
        .filter(sub => sub.category_id === cat.id)
        .map(sub => ({
          ...sub,
          searchQueries: JSON.parse(sub.search_queries || '[]')
        }))
    }));
  });

  // System stats for dashboard header
  fastify.get('/stats', async () => {
    const total = (db.prepare('SELECT COUNT(*) as c FROM leads').get() as any)?.c || 0;
    const noWebsite = (db.prepare('SELECT COUNT(*) as c FROM leads WHERE has_real_website = 0').get() as any)?.c || 0;
    const hasPhone = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE phone_primary IS NOT NULL AND phone_primary != ''").get() as any)?.c || 0;
    const hasInsta = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE instagram IS NOT NULL AND instagram != ''").get() as any)?.c || 0;
    const hasTg = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE telegram IS NOT NULL AND telegram != ''").get() as any)?.c || 0;

    return { total, noWebsite, hasPhone, hasInsta, hasTg };
  });
}
