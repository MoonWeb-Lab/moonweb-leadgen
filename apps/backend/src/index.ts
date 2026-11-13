import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { initDatabase } from './db/client.js';
import { bot } from './bot/bot.js';
import { catalogRoutes } from './routes/catalogRoutes.js';
import { leadRoutes } from './routes/leadRoutes.js';
import { exportRoutes } from './routes/exportRoutes.js';

const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'production' ? 'info' : 'warn'
  }
});

async function main() {
  console.log(`=======================================================`);
  console.log(`🚀 MoonWeb Lab • LeadGen Backend & Telegram Bot Server`);
  console.log(`=======================================================`);

  // 1. Initialize SQLite Database
  initDatabase();

  // 2. Register Plugins
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
  });

  // 3. Register REST API Routes under /api
  fastify.register(async (api) => {
    api.get('/health', async () => ({
      status: 'ok',
      service: 'moonweb-leadgen',
      time: new Date().toISOString()
    }));

    await api.register(catalogRoutes);
    await api.register(leadRoutes);
    await api.register(exportRoutes);
  }, { prefix: '/api' });

  // 4. Start HTTP Server
  try {
    const address = await fastify.listen({ port: config.port, host: config.host });
    console.log(`⚡ REST API запущено по адресу: ${address}`);
    console.log(`🔗 WebApp URL настроен на: ${config.webAppUrl}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  // 5. Start Telegram Bot (non-blocking)
  if (config.botToken) {
    console.log(`🤖 Запуск Telegram-бота (@MoonWebLeadGenBot)...`);
    bot.start({
      onStart: (info) => {
        console.log(`✅ Бот успешно подключен! Никнейм: @${info.username}`);
      }
    }).catch((err) => {
      console.error(`⚠️ Ошибка запуска Telegram-бота:`, err.message);
    });
  }
}

main();
