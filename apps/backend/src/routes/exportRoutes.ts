import { FastifyInstance } from 'fastify';
import { db } from '../db/client.js';
import { generateExcelBuffer } from '../services/xlsxService.js';
import { sendExportFileToUser } from '../bot/bot.js';

export async function exportRoutes(fastify: FastifyInstance) {
  // Download Excel directly in browser / Mini App
  fastify.post('/export/download', async (request, reply) => {
    const body = (request.body || {}) as any;
    const leads = fetchLeadsForExport(body);

    const buffer = generateExcelBuffer(leads);
    const filename = `MoonWeb_Leads_${Date.now()}.xlsx`;

    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    return reply.send(buffer);
  });

  // Send Excel file directly to user's Telegram chat via the bot
  fastify.post('/export/telegram', async (request, reply) => {
    const body = (request.body || {}) as { chatId?: number | string; filters?: any };
    if (!body.chatId) {
      return reply.status(400).send({ error: 'chatId is required to send via Telegram' });
    }

    try {
      const leads = fetchLeadsForExport(body.filters || {});
      await sendExportFileToUser(body.chatId, leads);
      return { success: true, count: leads.length };
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ error: err.message || 'Failed to send document to Telegram' });
    }
  });
}

function fetchLeadsForExport(filters: any) {
  const whereClauses: string[] = [];
  const params: any[] = [];

  if (filters.countryId) {
    whereClauses.push('l.country_id = ?');
    params.push(filters.countryId);
  }
  if (filters.cityId) {
    whereClauses.push('l.city_id = ?');
    params.push(filters.cityId);
  }
  if (filters.subcategoryId) {
    whereClauses.push('l.subcategory_id = ?');
    params.push(filters.subcategoryId);
  } else if (filters.categoryId) {
    whereClauses.push('sub.category_id = ?');
    params.push(filters.categoryId);
  }
  if (filters.onlyNoWebsite !== false) {
    whereClauses.push('l.has_real_website = 0');
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const sql = `
    SELECT 
      l.*,
      c.name as cityName,
      sub.name as subcategoryName,
      cat.name as categoryName
    FROM leads l
    JOIN cities c ON l.city_id = c.id
    LEFT JOIN subcategories sub ON l.subcategory_id = sub.id
    LEFT JOIN categories cat ON sub.category_id = cat.id
    ${whereSql}
    ORDER BY l.reviews_count DESC
    LIMIT 1000
  `;

  return db.prepare(sql).all(...params) as any[];
}
