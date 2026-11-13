import { Bot, InlineKeyboard, InputFile } from 'grammy';
import { config } from '../config.js';
import { db } from '../db/client.js';
import { generateExcelBuffer } from '../services/xlsxService.js';

export const bot = new Bot(config.botToken);

// Keyboard with Web App button
export function getMainMenuKeyboard() {
  return new InlineKeyboard()
    .webApp('🚀 Открыть LeadGen Mini App', config.webAppUrl)
    .row()
    .text('📊 Статистика базы', 'cmd_stats')
    .text('📥 Экспорт Excel', 'cmd_export');
}

// /start command
bot.command('start', async (ctx) => {
  const user = ctx.from;
  const name = user?.first_name || 'партнёр';

  const stats = getDatabaseStats();

  const welcomeMessage = 
`👋 **Привет, ${name}!**

Добро пожаловать в **MoonWeb LeadGen** — систему поиска и фильтрации локального бизнеса без сайтов (Беларусь 🇧🇾 и Россия 🇷🇺) для веб-студии **MoonWeb Lab**.

📊 **Текущая база:**
• Всего организаций в базе: **${stats.total}**
• 🔥 **БЕЗ САЙТА (Целевые):** **${stats.noWebsite}** (${stats.noWebsitePct}%)
• Топовые города: Минск, Брест, Могилёв, Гродно, Москва

👇 Нажмите кнопку ниже, чтобы запустить **Mini App** с интерактивными фильтрами, CRM и автогенератором коммерческих офферов!`;

  await ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: getMainMenuKeyboard()
  });
});

// /stats command
bot.command('stats', async (ctx) => {
  const stats = getDatabaseStats();
  const text = 
`📈 **Статистика MoonWeb LeadGen:**

• Всего компаний: **${stats.total}**
• Из них без сайта: **${stats.noWebsite}**
• С подтвержденным телефоном: **${stats.hasPhone}**
• Ссылка на Instagram: **${stats.hasInsta}**
• Ссылка на Telegram: **${stats.hasTg}**

🎯 **По статусам мини-CRM:**
• 🆕 Новые: **${stats.crmNew}**
• 💬 Написали: **${stats.crmContacted}**
• ⏳ В работе: **${stats.crmInProgress}**
• 🤝 Сделка: **${stats.crmWon}**`;

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: getMainMenuKeyboard()
  });
});

bot.callbackQuery('cmd_stats', async (ctx) => {
  await ctx.answerCallbackQuery();
  const stats = getDatabaseStats();
  await ctx.reply(
    `📊 В базе **${stats.total}** компаний, из них **${stats.noWebsite}** строго без сайта. Открывайте Mini App для выборки!`,
    { reply_markup: getMainMenuKeyboard() }
  );
});

// /export command
bot.command('export', async (ctx) => {
  await ctx.reply('⏳ Формирую свежий файл Excel по базе...');
  try {
    const leads = db.prepare(`
      SELECT l.*, c.name as cityName, cat.name as categoryName
      FROM leads l
      JOIN cities c ON l.city_id = c.id
      LEFT JOIN subcategories sub ON l.subcategory_id = sub.id
      LEFT JOIN categories cat ON sub.category_id = cat.id
      WHERE l.has_real_website = 0
      ORDER BY l.id DESC
      LIMIT 500
    `).all() as any[];

    const buffer = generateExcelBuffer(leads);
    const filename = `MoonWeb_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`;

    await ctx.replyWithDocument(new InputFile(buffer, filename), {
      caption: `📁 Выгрузка лидов БЕЗ САЙТА (${leads.length} организаций). Приятных продаж!`
    });
  } catch (err: any) {
    await ctx.reply(`❌ Ошибка экспорта: ${err.message}`);
  }
});

bot.callbackQuery('cmd_export', async (ctx) => {
  await ctx.answerCallbackQuery();
  const leads = db.prepare(`
    SELECT l.*, c.name as cityName, cat.name as categoryName
    FROM leads l
    JOIN cities c ON l.city_id = c.id
    LEFT JOIN subcategories sub ON l.subcategory_id = sub.id
    LEFT JOIN categories cat ON sub.category_id = cat.id
    WHERE l.has_real_website = 0
    ORDER BY l.id DESC
    LIMIT 500
  `).all() as any[];

  const buffer = generateExcelBuffer(leads);
  const filename = `MoonWeb_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`;

  await ctx.replyWithDocument(new InputFile(buffer, filename), {
    caption: `📁 Выгрузка целевых лидов (${leads.length} организаций)`
  });
});

// Function to send export directly to a user by chat ID
export async function sendExportFileToUser(chatId: number | string, leadsData: any[]) {
  const buffer = generateExcelBuffer(leadsData);
  const filename = `MoonWeb_Export_${Date.now()}.xlsx`;
  await bot.api.sendDocument(chatId, new InputFile(buffer, filename), {
    caption: `📊 Экспорт из Telegram Mini App: **${leadsData.length} лидов** отобрано по вашим фильтрам.`,
    parse_mode: 'Markdown'
  });
}

function getDatabaseStats() {
  const total = (db.prepare('SELECT COUNT(*) as c FROM leads').get() as any)?.c || 0;
  const noWebsite = (db.prepare('SELECT COUNT(*) as c FROM leads WHERE has_real_website = 0').get() as any)?.c || 0;
  const hasPhone = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE phone_primary IS NOT NULL AND phone_primary != ''").get() as any)?.c || 0;
  const hasInsta = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE instagram IS NOT NULL AND instagram != ''").get() as any)?.c || 0;
  const hasTg = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE telegram IS NOT NULL AND telegram != ''").get() as any)?.c || 0;

  const crmNew = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE crm_status = 'new'").get() as any)?.c || 0;
  const crmContacted = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE crm_status = 'contacted'").get() as any)?.c || 0;
  const crmInProgress = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE crm_status = 'in_progress'").get() as any)?.c || 0;
  const crmWon = (db.prepare("SELECT COUNT(*) as c FROM leads WHERE crm_status = 'won'").get() as any)?.c || 0;

  const noWebsitePct = total > 0 ? Math.round((noWebsite / total) * 100) : 0;

  return { total, noWebsite, noWebsitePct, hasPhone, hasInsta, hasTg, crmNew, crmContacted, crmInProgress, crmWon };
}
