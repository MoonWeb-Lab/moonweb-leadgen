# 🚀 MoonWeb LeadGen • Telegram Mini App & Лидогенерация

Полноценная система лидогенерации для веб-студии **MoonWeb Lab**, состоящая из:
1. **Telegram-бота** (`grammy`) — подключен к токену бота `@ParserMoonWebLab_bot`
2. **Telegram Mini App (Web App)** — стеклянный UI в тёмной теме (`#070C18`), неоновые акценты, тактильный отклик (haptic), быстрые фильтры и мини-CRM
3. **Backend REST API** — Fastify + SQLite WAL mode (`node:sqlite` встроенный в Node v26)
4. **Генератора коммерческих офферов** — персонализированные тексты для HoReCa, Beauty, Авто, Мебели/Ремонта и Агроусадеб без сложного IT-жаргона
5. **Экспорт данных** — моментальная выгрузка `.xlsx` в браузере или прямая отправка файла пользователю в Telegram-диалог с ботом

---

## 📁 Структура Monorepo

```
moonweb-leadgen/
├── .env                           # Конфигурация, токены и ссылки студии
├── package.json                   # Скрипты запуска monorepo
├── packages/
│   └── shared/                    # Общие TypeScript интерфейсы и типы
└── apps/
    ├── backend/                   # Fastify REST API + grammY Telegram-бот
    │   ├── src/
    │   │   ├── bot/bot.ts         # Обработка команд /start, /stats, /export, Inline WebApp
    │   │   ├── db/client.ts       # Инициализация SQLite WAL, авто-наполнение справочника
    │   │   ├── db/catalogData.ts  # 2 страны, 22 города, 9 макро-категорий, 42 ниши
    │   │   ├── routes/            # /api/catalog/*, /api/leads/*, /api/export/*
    │   │   └── services/          # offerService (офферы) и xlsxService (Excel экспорт)
    ├── webapp/                    # React 18 + Vite + Tailwind CSS Mini App
    │   ├── src/
    │   │   ├── api/client.ts      # Типизированный клиент API
    │   │   ├── hooks/useTelegram  # Telegram WebApp SDK, тема, haptics, safe fallback
    │   │   ├── components/        # Header, CountryCitySelector, NicheCatalog, FilterBar, LeadCard, OfferModal, ExportModal
    │   │   └── App.tsx            # Основной экран приложения
    └── worker/                    # Парсеры и стартовый seed данных
        └── src/
            ├── normalizers/       # Фильтр правила «Без сайта» и очистка телефонов
            └── seeds/seedLeads.ts # 32 проверенные организации Минска и Могилёва
```

---

## ⚡ Быстрый запуск

### 1. Запуск Backend и Telegram-бота (Порт 3000)
```bash
cd apps/backend
npm run dev
```

### 2. Запуск Telegram Mini App (Порт 5173 с прокси на 3000)
```bash
cd apps/webapp
npm run dev
```

### 3. Дополнительное наполнение тестовой базы (при необходимости)
```bash
cd apps/worker
npm run seed
```

---

## 🌐 Подключение Mini App к Telegram через Cloudflare Tunnel

Поскольку в `apps/webapp/vite.config.ts` запросы `/api` автоматически проксируются на `http://localhost:3000`, **достаточно запустить один единственный HTTPS-туннель на порт 5173**:

```bash
npx cloudflared tunnel --url http://localhost:5173
```

Полученный адрес (например: `https://xxxx-xx-xx-xx.trycloudflare.com`) привязывается к боту:

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Введите `/mybots` и выберите вашего бота
3. Перейдите в **Bot Settings** -> **Menu Button** -> **Configure menu button**
4. Вставьте ссылку туннеля и задайте название кнопки, например: `🚀 Найти лидов`
5. Также обновите `WEBAPP_URL` в `.env` на ваш URL туннеля
