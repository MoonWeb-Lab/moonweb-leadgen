/**
 * MoonWeb Lab • Instagram Session Login
 * Открывает Google Chrome без ограничений по времени,
 * чтобы спокойно ввести логин, пароль и подтвердить код.
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { chromium, type BrowserContext, type Page } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.resolve(__dirname, '../../.ig_browser_profile');

async function loginInstagram(): Promise<void> {
  console.log('\n===============================================================');
  console.log('🔑 MoonWeb Lab • Вход в аккаунт Instagram');
  console.log('===============================================================\n');

  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  console.log('🚀 Запуск Google Chrome...');
  const context: BrowserContext = await chromium.launchPersistentContext(USER_DATA_DIR, {
    executablePath: CHROME_PATH,
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
    ],
  });

  const page: Page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  try {
    console.log('🌐 Открытие страницы входа Instagram...');
    await page.goto('https://www.instagram.com/accounts/login/', {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    });

    console.log('\n---------------------------------------------------------------');
    console.log('👉 В открывшемся окне Chrome спокойно войдите в аккаунт Instagram.');
    console.log('   Введите логин, пароль, подтвердите код SMS/2FA, если Instagram запросит.');
    console.log('');
    console.log('⏳ ВРЕМЯ НЕ ОГРАНИЧЕНО: браузер не закроется, пока вы сами не решите.');
    console.log('---------------------------------------------------------------');
    console.log('👉 После успешного входа в профиль вернитесь в это окно и:');
    
    const rl = readline.createInterface({ input, output });
    await rl.question('   НАЖМИТЕ [ENTER], чтобы сохранить сессию: ');
    rl.close();

    console.log('\n🎉 Отлично! Сессия аккаунта успешно сохранена навсегда!');
    console.log('Теперь можно запускать робота через start_instagram_robot.bat.\n');

  } finally {
    await context.close();
  }
}

loginInstagram().catch(console.error);
