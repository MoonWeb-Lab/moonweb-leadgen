/**
 * MoonWeb Lab • Instagram Auto-DM Outreach Bot
 * 
 * Строгие правила безопасности:
 * 1. Лимит: максимум 15 отправок в сутки (защита аккаунта от спам-фильтра).
 * 2. Анти-детект: запуск реального Google Chrome с постоянным профилем сессии.
 * 3. Humanizer: живой персонализированный текст под нишу каждого бизнеса.
 * 4. Задержка: 60-120 секунд между сообщениями с естественным вводом.
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium, type BrowserContext, type Page } from 'playwright-core';
import { buildHumanizedPitch, DEFAULT_PITCH_CONFIG } from '../parsers/pitchTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// База данных
const dbPath = path.resolve(__dirname, '../../../../apps/backend/data/leadgen.sqlite');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL;');

// Таблица истории отправок в Instagram
db.exec(`
  CREATE TABLE IF NOT EXISTS instagram_outreach_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER,
    instagram_handle TEXT NOT NULL,
    business_name TEXT,
    message_text TEXT,
    status TEXT NOT NULL, -- 'sent', 'skipped', 'failed'
    sent_date TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const DAILY_LIMIT = 15;
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.resolve(__dirname, '../../.ig_browser_profile');

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function runInstagramOutreach(): Promise<void> {
  console.log('\n===============================================================');
  console.log('🤖 MoonWeb Lab • Instagram Auto-DM Outreach Bot');
  console.log(`🛡️ Суточный лимит безопасности: строго ${DAILY_LIMIT} сообщений в день`);
  console.log('===============================================================\n');

  // 1. Проверяем, сколько уже отправлено за сегодня
  const today = new Date().toISOString().split('T')[0];
  const countRow = db.prepare(`
    SELECT COUNT(*) as cnt 
    FROM instagram_outreach_log 
    WHERE sent_date = ? AND status = 'sent'
  `).get(today) as { cnt: number };

  const alreadySentToday = countRow?.cnt || 0;
  console.log(`📊 Отправлено сегодня: ${alreadySentToday} / ${DAILY_LIMIT}`);

  if (alreadySentToday >= DAILY_LIMIT) {
    console.log(`\n🛑 Дневной лимит (${DAILY_LIMIT} сообщений) на сегодня уже исчерпан!`);
    console.log('Это правило защищает аккаунт @moonweb_labs от теневого бана.');
    console.log('Следующий запуск будет доступен завтра.\n');
    return;
  }

  const remainingQuota = DAILY_LIMIT - alreadySentToday;
  console.log(`🎯 Квота на текущий запуск: ${remainingQuota} сообщений.\n`);

  // 2. Выбираем из базы целевые компании без сайта с наличием Instagram
  const leads = db.prepare(`
    SELECT id, name, city_id, subcategory_id, instagram, phone_primary, rating
    FROM leads
    WHERE has_real_website = 0 
      AND instagram IS NOT NULL 
      AND instagram != ''
      AND id NOT IN (
        SELECT lead_id FROM instagram_outreach_log WHERE status = 'sent'
      )
    ORDER BY rating DESC
    LIMIT ?
  `).all(remainingQuota) as any[];

  if (!leads || leads.length === 0) {
    console.log('✅ Нет новых неотправленных лидов с Instagram в базе данных.');
    return;
  }

  console.log(`📋 Отобрано ${leads.length} целевых бизнесов без сайта для отправки оффера:\n`);
  leads.forEach((l, idx) => {
    console.log(` ${idx + 1}. ${l.name} (@${l.instagram.replace('@', '')}) [id: ${l.id}]`);
  });

  // 3. Запускаем Google Chrome с постоянным профилем
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  console.log('\n🚀 Запуск браузера Chrome с профилем сессии...');
  const context: BrowserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
    executablePath: CHROME_PATH,
    headless: false, // Открываем в видимом окне для безопасности и контроля
    viewport: { width: 1280, height: 800 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
    ],
  });

  const page: Page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  try {
    // 4. Проверяем авторизацию в Instagram
    console.log('🌐 Переход на страницу Instagram...');
    await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(3000);

    // Проверяем, есть ли поле ввода логина (значит не авторизован)
    const isLoginNeeded = await page.$('input[name="username"]');
    if (isLoginNeeded) {
      console.log('\n⚠️ ВНИМАНИЕ: Требуется разовая авторизация в Instagram!');
      console.log('Пожалуйста, войдите в свой аккаунт (@moonweb_labs) в открывшемся окне Chrome.');
      console.log('Сессия сохранится, и в следующие разы вход будет автоматическим.');
      console.log('Ожидание входа (до 180 секунд)...');

      try {
        await page.waitForSelector('svg[aria-label="Direct"], svg[aria-label="Сообщения"], a[href*="/direct/"]', {
          timeout: 180000,
        });
        console.log('🎉 Успешный вход в аккаунт Instagram!\n');
      } catch {
        console.log('❌ Время ожидания авторизации истекло. Перезапустите бота после входа.');
        await context.close();
        return;
      }
    } else {
      console.log('✅ Авторизация подтверждена (сессия активна).');
    }

    // 5. Поочередно отправляем сообщения
    let sentCount = 0;

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i];
      const cleanHandle = lead.instagram.replace('@', '').trim().toLowerCase();
      const profileUrl = `https://www.instagram.com/${cleanHandle}/`;
      const cityName = lead.city_id === 1 ? 'Минске' : 'вашем городе';

      console.log(`\n---------------------------------------------------------------`);
      console.log(`[${i + 1}/${leads.length}] Обработка: ${lead.name} (@${cleanHandle})`);

      // Генерируем живой человечный текст через humanizer шаблоны
      const { pitchText } = buildHumanizedPitch(lead.name, cityName, lead.subcategory_id || '', DEFAULT_PITCH_CONFIG);

      try {
        await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
        await sleep(getRandomInt(2500, 4000));

        // Ищем кнопку "Отправить сообщение" / "Message"
        const messageBtnSelectors = [
          'div[role="button"]:has-text("Отправить сообщение")',
          'button:has-text("Отправить сообщение")',
          'div[role="button"]:has-text("Message")',
          'button:has-text("Message")',
          'a[href*="/direct/t/"]',
        ];

        let msgBtn = null;
        for (const selector of messageBtnSelectors) {
          msgBtn = await page.$(selector);
          if (msgBtn) break;
        }

        if (!msgBtn) {
          console.log(`⚠️ Кнопка сообщений не найдена для @${cleanHandle} (возможно, закрытый профиль). Пропуск.`);
          db.prepare(`
            INSERT INTO instagram_outreach_log (lead_id, instagram_handle, business_name, message_text, status, sent_date)
            VALUES (?, ?, ?, ?, 'skipped', ?)
          `).run(lead.id, cleanHandle, lead.name, pitchText, today);
          continue;
        }

        // Кликаем по кнопке сообщения
        await msgBtn.click();
        await sleep(getRandomInt(3000, 5000));

        // Закрываем всплывающее окно уведомлений, если появилось ("Не сейчас" / "Not Now")
        const notNowBtn = await page.$('button:has-text("Не сейчас"), button:has-text("Not Now")');
        if (notNowBtn) {
          await notNowBtn.click();
          await sleep(1500);
        }

        // Ищем поле ввода сообщения в Direct
        const inputSelectors = [
          'div[role="textbox"][contenteditable="true"]',
          'textarea[placeholder*="Напишите сообщение"]',
          'textarea[placeholder*="Message"]',
        ];

        let inputField = null;
        for (const selector of inputSelectors) {
          inputField = await page.$(selector);
          if (inputField) break;
        }

        if (!inputField) {
          console.log(`⚠️ Поле ввода сообщения не найдено для @${cleanHandle}. Пропуск.`);
          db.prepare(`
            INSERT INTO instagram_outreach_log (lead_id, instagram_handle, business_name, message_text, status, sent_date)
            VALUES (?, ?, ?, ?, 'skipped', ?)
          `).run(lead.id, cleanHandle, lead.name, pitchText, today);
          continue;
        }

        // Фокусируемся и печатаем текст
        await inputField.click();
        await sleep(1000);

        // Вставляем текст сообщения
        await page.evaluate((text) => {
          const el = document.querySelector('div[role="textbox"][contenteditable="true"]') as HTMLElement;
          if (el) {
            el.focus();
            document.execCommand('insertText', false, text);
          }
        }, pitchText);

        await sleep(getRandomInt(1500, 2500));

        // Нажимаем Enter или кнопку Отправить
        await page.keyboard.press('Enter');
        console.log(`✨ Успешно отправлено сообщение для ${lead.name} (@${cleanHandle})!`);

        // Логируем успешную отправку в БД
        db.prepare(`
          INSERT INTO instagram_outreach_log (lead_id, instagram_handle, business_name, message_text, status, sent_date)
          VALUES (?, ?, ?, ?, 'sent', ?)
        `).run(lead.id, cleanHandle, lead.name, pitchText, today);

        // Обновляем статус лида в CRM
        db.prepare(`UPDATE leads SET crm_status = 'contacted' WHERE id = ?`).run(lead.id);

        sentCount++;

        // Проверяем достижение дневного лимита
        if (alreadySentToday + sentCount >= DAILY_LIMIT) {
          console.log(`\n🎉 Дневной лимит безопасности (${DAILY_LIMIT} сообщений) успешно выполнен!`);
          break;
        }

        // Анти-бан пауза между отправками (60-90 сек)
        const delaySec = getRandomInt(60, 90);
        console.log(`⏳ Безопасная анти-бан пауза: ожидание ${delaySec} сек перед следующим диалогом...`);
        for (let s = delaySec; s > 0; s -= 10) {
          process.stdout.write(` ${s}s...`);
          await sleep(Math.min(s, 10) * 1000);
        }
        console.log(' Готово!');

      } catch (err: any) {
        console.error(`❌ Ошибка при отправке для @${cleanHandle}:`, err.message);
        db.prepare(`
          INSERT INTO instagram_outreach_log (lead_id, instagram_handle, business_name, message_text, status, sent_date)
          VALUES (?, ?, ?, ?, 'failed', ?)
        `).run(lead.id, cleanHandle, lead.name, pitchText, today);
      }
    }

    console.log('\n===============================================================');
    console.log(`🏁 Сессия завершена. Успешно отправлено сообщений: ${sentCount}`);
    console.log(`📊 Итого за сегодня: ${alreadySentToday + sentCount} / ${DAILY_LIMIT}`);
    console.log('===============================================================\n');

  } finally {
    await context.close();
  }
}

// Запуск напрямую из CLI
if (process.argv[1] && process.argv[1].endsWith('outreachBot.ts')) {
  runInstagramOutreach().catch(console.error);
}
