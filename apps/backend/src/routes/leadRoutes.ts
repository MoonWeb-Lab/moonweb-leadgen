import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { generateOffer } from '../services/offerService.js';

export async function leadRoutes(fastify: FastifyInstance) {
  // Query leads with robust filters and pagination
  fastify.get('/leads', async (request) => {
    const q = request.query as any;

    const countryId = q.countryId;
    const cityId = q.cityId ? parseInt(q.cityId, 10) : undefined;
    const categoryId = q.categoryId;
    const subcategoryId = q.subcategoryId;
    const onlyNoWebsite = q.onlyNoWebsite === 'true' || q.onlyNoWebsite === true;
    const hasInstagram = q.hasInstagram === 'true' || q.hasInstagram === true;
    const hasTelegram = q.hasTelegram === 'true' || q.hasTelegram === true;
    const hasPhone = q.hasPhone === 'true' || q.hasPhone === true;
    const minRating = q.minRating ? parseFloat(q.minRating) : undefined;
    const crmStatus = q.crmStatus && q.crmStatus !== 'all' ? q.crmStatus : undefined;
    const search = q.search ? q.search.trim() : undefined;
    const sortBy = q.sortBy || 'reviews'; // 'reviews', 'rating', 'name', 'id'
    const sortOrder = q.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const page = Math.max(1, parseInt(q.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(q.limit || '20', 10)));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];

    if (countryId) {
      whereClauses.push('l.country_id = ?');
      params.push(countryId);
    }

    if (cityId) {
      whereClauses.push('l.city_id = ?');
      params.push(cityId);
    }

    if (subcategoryId) {
      whereClauses.push('l.subcategory_id = ?');
      params.push(subcategoryId);
    } else if (categoryId) {
      whereClauses.push('sub.category_id = ?');
      params.push(categoryId);
    }

    if (onlyNoWebsite) {
      whereClauses.push('l.has_real_website = 0');
    }

    if (hasInstagram) {
      whereClauses.push("(l.instagram IS NOT NULL AND l.instagram != '')");
    }

    if (hasTelegram) {
      whereClauses.push("(l.telegram IS NOT NULL AND l.telegram != '')");
    }

    if (hasPhone) {
      whereClauses.push("(l.phone_primary IS NOT NULL AND l.phone_primary != '')");
    }

    if (minRating) {
      whereClauses.push('l.rating >= ?');
      params.push(minRating);
    }

    if (crmStatus) {
      whereClauses.push('l.crm_status = ?');
      params.push(crmStatus);
    }

    if (search) {
      whereClauses.push('(l.name LIKE ? OR l.address LIKE ? OR l.phone_primary LIKE ?)');
      const wild = `%${search}%`;
      params.push(wild, wild, wild);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Order clause
    let orderSql = 'l.reviews_count DESC';
    if (sortBy === 'rating') orderSql = 'l.rating DESC, l.reviews_count DESC';
    if (sortBy === 'name') orderSql = 'l.name ASC';
    if (sortBy === 'newest') orderSql = 'l.id DESC';

    // 1. Total matching count
    const countSql = `
      SELECT COUNT(*) as cnt 
      FROM leads l
      LEFT JOIN subcategories sub ON l.subcategory_id = sub.id
      ${whereSql}
    `;
    const countRow = db.prepare(countSql).get(...params) as { cnt: number };
    const total = countRow?.cnt || 0;

    // 2. Fetch page data
    const querySql = `
      SELECT 
        l.*,
        c.name as cityName,
        sub.name as subcategoryName,
        cat.id as categoryId,
        cat.name as categoryName,
        cat.emoji as categoryEmoji
      FROM leads l
      JOIN cities c ON l.city_id = c.id
      LEFT JOIN subcategories sub ON l.subcategory_id = sub.id
      LEFT JOIN categories cat ON sub.category_id = cat.id
      ${whereSql}
      ORDER BY ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const rawRows = db.prepare(querySql).all(...params, limit, offset) as any[];

    // Format computed fields (Telegram / Viber links)
    const data = rawRows.map(row => {
      const cleanPhone = (row.phone_primary || '').replace(/[^0-9]/g, '');
      const tgLink = row.telegram 
        ? (row.telegram.startsWith('http') ? row.telegram : `https://t.me/${row.telegram.replace('@', '')}`)
        : (cleanPhone ? `https://t.me/+${cleanPhone}` : undefined);
      
      const viberLink = cleanPhone ? `viber://chat?number=%2B${cleanPhone}` : undefined;
      const phoneLink = row.phone_primary ? `tel:${row.phone_primary}` : undefined;
      const yandexMapsUrl = row.yandex_maps_url || `https://yandex.ru/maps/?text=${encodeURIComponent(row.cityName + ', ' + row.name + (row.address ? ', ' + row.address : ''))}`;

      return {
        id: row.id,
        externalId: row.external_id,
        countryId: row.country_id,
        cityId: row.city_id,
        cityName: row.cityName,
        subcategoryId: row.subcategory_id,
        subcategoryName: row.subcategoryName,
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        categoryEmoji: row.categoryEmoji,
        name: row.name,
        address: row.address,
        lat: row.lat,
        lon: row.lon,
        rating: row.rating,
        reviewsCount: row.reviews_count,
        rawWebsite: row.raw_website,
        hasRealWebsite: Boolean(row.has_real_website),
        phonePrimary: row.phone_primary,
        phonesExtra: row.phones_extra ? JSON.parse(row.phones_extra) : [],
        instagram: row.instagram,
        telegram: row.telegram,
        vk: row.vk,
        source: row.source,
        sourceUrl: row.source_url,
        crmStatus: row.crm_status || 'new',
        crmNotes: row.crm_notes || '',
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        tgLink,
        viberLink,
        phoneLink,
        yandexMapsUrl
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  });

  // Get single lead details + generated offer
  fastify.get('/leads/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const lead = db.prepare(`
      SELECT 
        l.*,
        c.name as cityName,
        sub.name as subcategoryName,
        cat.id as categoryId,
        cat.name as categoryName,
        cat.emoji as categoryEmoji
      FROM leads l
      JOIN cities c ON l.city_id = c.id
      LEFT JOIN subcategories sub ON l.subcategory_id = sub.id
      LEFT JOIN categories cat ON sub.category_id = cat.id
      WHERE l.id = ?
    `).get(id) as any;

    if (!lead) return reply.status(404).send({ error: 'Lead not found' });
    return lead;
  });

  // Update CRM status and notes
  fastify.patch('/leads/:id/crm', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { crmStatus?: string; crmNotes?: string };

    const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(id);
    if (!lead) return reply.status(404).send({ error: 'Lead not found' });

    if (body.crmStatus) {
      db.prepare("UPDATE leads SET crm_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(body.crmStatus, id);
    }
    if (body.crmNotes !== undefined) {
      db.prepare("UPDATE leads SET crm_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(body.crmNotes, id);
    }

    return { success: true, id, status: body.crmStatus };
  });

  // Generate commercial offer for a lead
  fastify.post('/leads/:id/offer', async (request, reply) => {
    const { id } = request.params as { id: string };
    const lead = db.prepare(`
      SELECT l.*, c.name as cityName, cat.name as categoryName
      FROM leads l
      JOIN cities c ON l.city_id = c.id
      LEFT JOIN subcategories sub ON l.subcategory_id = sub.id
      LEFT JOIN categories cat ON sub.category_id = cat.id
      WHERE l.id = ?
    `).get(id) as any;

    if (!lead) return reply.status(404).send({ error: 'Lead not found' });

    const offer = generateOffer({
      id: lead.id,
      name: lead.name,
      cityName: lead.cityName,
      categoryName: lead.categoryName,
      subcategoryId: lead.subcategory_id,
      phonePrimary: lead.phone_primary,
      instagram: lead.instagram,
      rating: lead.rating
    });

    return offer;
  });
}
