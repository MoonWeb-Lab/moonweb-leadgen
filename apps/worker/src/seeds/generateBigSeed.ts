import fs from 'fs';
import path from 'path';

// Helper templates by category
const CITY_TEMPLATES: Record<number, { countryId: 'BY' | 'RU'; name: string; phoneCode: string; streets: string[] }> = {
  1: { countryId: 'BY', name: 'Минск', phoneCode: '+37529', streets: ['пр-т Независимости', 'ул. Немига', 'ул. Зыбицкая', 'пр-т Дзержинского', 'пр-т Победителей', 'ул. Притыцкого', 'ул. Сурганова', 'ул. Кальварийская', 'ул. Богдановича', 'ул. Якуба Коласа'] },
  2: { countryId: 'BY', name: 'Брест', phoneCode: '+37529', streets: ['ул. Советская', 'ул. Гоголя', 'пр-т Машерова', 'бульвар Космонавтов', 'ул. Московская', 'ул. Ленина'] },
  3: { countryId: 'BY', name: 'Гродно', phoneCode: '+37529', streets: ['ул. Советская', 'ул. Ожешко', 'ул. Большая Троицкая', 'ул. Карла Маркса', 'ул. Горького', 'ул. Кирова'] },
  4: { countryId: 'BY', name: 'Гомель', phoneCode: '+37529', streets: ['пр-т Ленина', 'ул. Советская', 'пр-т Победы', 'ул. Кирова', 'ул. Интернациональная', 'ул. Барыкина'] },
  5: { countryId: 'BY', name: 'Могилёв', phoneCode: '+37529', streets: ['ул. Ленинская', 'ул. Первомайская', 'пр-т Мира', 'ул. Пионерская', 'ул. Челюскинцев', 'ул. Лазаренко', 'ул. Болдина'] },
  6: { countryId: 'BY', name: 'Витебск', phoneCode: '+37529', streets: ['ул. Ленина', 'ул. Суворова', 'пр-т Черняховского', 'пр-т Фрунзе', 'Московский пр-т', 'ул. Замковая'] },
  7: { countryId: 'BY', name: 'Барановичи', phoneCode: '+37529', streets: ['ул. Советская', 'ул. Комсомольская', 'ул. Ленина', 'ул. Брестская'] },
  8: { countryId: 'BY', name: 'Бобруйск', phoneCode: '+37529', streets: ['ул. Социалистическая', 'ул. Минская', 'ул. Советская', 'ул. Интернациональная'] },
  9: { countryId: 'BY', name: 'Борисов', phoneCode: '+37529', streets: ['пр-т Революции', 'ул. Гагарина', 'ул. Чапаева', 'ул. 30 лет ВЛКСМ'] },
  10: { countryId: 'BY', name: 'Пинск', phoneCode: '+37529', streets: ['ул. Ленина', 'ул. Первомайская', 'ул. Брестская', 'ул. Белова'] },
  11: { countryId: 'BY', name: 'Лида', phoneCode: '+37529', streets: ['ул. Советская', 'ул. Ленинская', 'ул. Мицкевича', 'ул. Кирова'] },
  12: { countryId: 'BY', name: 'Мозырь', phoneCode: '+37529', streets: ['ул. Ленинская', 'ул. Советская', 'бульвар Юности', 'ул. Мира'] },
  13: { countryId: 'RU', name: 'Москва', phoneCode: '+7925', streets: ['ул. Тверская', 'ул. Арбат', 'Кутузовский пр-т', 'Ленинградский пр-т', 'ул. Покровка', 'Пресненская наб.', 'ул. Большая Дмитровка', 'Ленинский пр-т'] },
  14: { countryId: 'RU', name: 'Санкт-Петербург', phoneCode: '+7921', streets: ['Невский пр-т', 'ул. Рубинштейна', 'Литейный пр-т', 'Каменноостровский пр-т', 'Московский пр-т', 'Большой пр-т П.С.'] },
  15: { countryId: 'RU', name: 'Смоленск', phoneCode: '+7910', streets: ['ул. Ленина', 'ул. Николаева', 'ул. Кирова', 'ул. Большая Советская'] },
  16: { countryId: 'RU', name: 'Брянск', phoneCode: '+7910', streets: ['пр-т Ленина', 'ул. Красноармейская', 'ул. Фокина', 'ул. Дуки'] },
  17: { countryId: 'RU', name: 'Псков', phoneCode: '+7911', streets: ['Октябрьский пр-т', 'ул. Советская', 'Рижский пр-т', 'ул. Некрасова'] },
  18: { countryId: 'RU', name: 'Казань', phoneCode: '+7927', streets: ['ул. Баумана', 'ул. Кремлевская', 'ул. Пушкина', 'ул. Чистопольская'] },
  19: { countryId: 'RU', name: 'Нижний Новгород', phoneCode: '+7920', streets: ['ул. Большая Покровская', 'ул. Родионова', 'ул. Белинского', 'пр-т Гагарина'] },
  20: { countryId: 'RU', name: 'Екатеринбург', phoneCode: '+7922', streets: ['ул. Ленина', 'ул. Малышева', 'ул. Радищева', 'ул. 8 Марта'] },
  21: { countryId: 'RU', name: 'Краснодар', phoneCode: '+7918', streets: ['ул. Красная', 'ул. Северная', 'ул. Ставропольская', 'ул. Кубанская наб.'] },
  22: { countryId: 'RU', name: 'Сочи', phoneCode: '+7918', streets: ['Курортный пр-т', 'ул. Навагинская', 'ул. Горького', 'ул. Черноморская'] }
};

interface NicheMeta {
  subcategoryId: string;
  subcategoryName: string;
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  names: string[];
}

const NICHES: NicheMeta[] = [
  // HoReCa
  {
    subcategoryId: 'coffee',
    subcategoryName: 'Кофейни и спешелти-кофе',
    categoryId: 'horeca',
    categoryName: 'HoReCa и Общепит',
    categoryEmoji: '☕',
    names: ['Кофейня «Зёрна»', 'Кофе-бар «Stories Coffee»', 'Спешелти-кофе «Wake Up»', 'Кофейня «Тепло и Пенка»', 'Coffee Point «Black Roast»', 'Атмосферная кофейня «Уют»', 'Кофейня «Эспрессо Бар»', 'Кофе & Десерты «Caramel»']
  },
  {
    subcategoryId: 'food_delivery',
    subcategoryName: 'Доставка еды, суши и пиццы',
    categoryId: 'horeca',
    categoryName: 'HoReCa и Общепит',
    categoryEmoji: '☕',
    names: ['Доставка суши «Tokyo Roll»', 'Пиццерия навынос «Mario Pizza»', 'Гриль & Бургеры «Craft Meat»', 'Доставка шашлыка «Мясо на Углях»', 'Суши & Wok «Сакура Экспресс»']
  },
  {
    subcategoryId: 'catering',
    subcategoryName: 'Кейтеринг и гастробоксы',
    categoryId: 'horeca',
    categoryName: 'HoReCa и Общепит',
    categoryEmoji: '☕',
    names: ['Гастробоксы & Кейтеринг «Furshet Time»', 'Кейтеринг «Smart Buffet»', 'Фуршеты и канапе «Holiday Box»', 'Кейтеринговая служба «Prestige Food»']
  },

  // Beauty
  {
    subcategoryId: 'barbershop',
    subcategoryName: 'Барбершопы',
    categoryId: 'beauty',
    categoryName: 'Бьюти и Уход',
    categoryEmoji: '💅',
    names: ['Мужская парикмахерская «Бритва»', 'Барбершоп «Black Beard»', 'Барбершоп «TopGun Barber»', 'Барбер-студия «Old School»', 'Барбершоп «Gentleman Club»', 'Мужские стрижки «Чоп»']
  },
  {
    subcategoryId: 'nails',
    subcategoryName: 'Студии маникюра и педикюра',
    categoryId: 'beauty',
    categoryName: 'Бьюти и Уход',
    categoryEmoji: '💅',
    names: ['Ногтевая студия «Nail Art Studio»', 'Студия маникюра «Pink Berry»', 'Студия красоты «Glossy Nails»', 'Студия ногтевого сервиса «French»', 'Маникюр & Педикюр «Beauty Bar»']
  },
  {
    subcategoryId: 'beauty_salon',
    subcategoryName: 'Салоны красоты',
    categoryId: 'beauty',
    categoryName: 'Бьюти и Уход',
    categoryEmoji: '💅',
    names: ['Студия колористики «Monro Beauty»', 'Салон красоты «Эстет»', 'Пространство красоты «Secret Room»', 'Студия стиля «Образ»', 'Салон красоты «Персона»']
  },

  // Auto
  {
    subcategoryId: 'detailing',
    subcategoryName: 'Детейлинг и полировка',
    categoryId: 'auto',
    categoryName: 'Автобизнес',
    categoryEmoji: '🚗',
    names: ['Детейлинг-студия «ProGlaze»', 'Центр ухода за авто «Detailing Lab»', 'Студия автостайлинга «Black Edition»', 'Полировка и керамика «Shine Garage»', 'Детейлинг «Prime Auto»']
  },
  {
    subcategoryId: 'carwash',
    subcategoryName: 'Автомойки и химчистка',
    categoryId: 'auto',
    categoryName: 'Автобизнес',
    categoryEmoji: '🚗',
    names: ['Автомойка «Чистый Стиль»', 'Комплексная мойка «H2O Экспресс»', 'Химчистка салона «EcoWash»', 'Мойка самообслуживания «Aqua Clean»']
  },
  {
    subcategoryId: 'autoservice',
    subcategoryName: 'СТО и ремонт двигателей/подвески',
    categoryId: 'auto',
    categoryName: 'Автобизнес',
    categoryEmoji: '🚗',
    names: ['Автосервис «Мастер-Авто»', 'СТО «Дизель Моторс»', 'Ремонт подвески и тормозов «Турбо Сервис»', 'Техцентр «АвтоЭксперт»']
  },

  // Construction & Furniture
  {
    subcategoryId: 'kitchens',
    subcategoryName: 'Кухни и корпусная мебель на заказ',
    categoryId: 'construction',
    categoryName: 'Ремонт и Мебель',
    categoryEmoji: '🔨',
    names: ['Кухни на заказ «Loft Мебель»', 'Мебельная фабрика «Modern Kitchens»', 'Корпусная мебель «Мастер Вуд»', 'Шкафы-купе и кухни «Art Design»', 'Кухни под ключ «Comfort Home»']
  },
  {
    subcategoryId: 'apartment_renovation',
    subcategoryName: 'Ремонт квартир под ключ',
    categoryId: 'construction',
    categoryName: 'Ремонт и Мебель',
    categoryEmoji: '🔨',
    names: ['Ремонт квартир «Строй Бригада»', 'Отделка под ключ «Новый Дом»', 'Ремонт квартир и коттеджей «Master Build»', 'Евроремонт «Профи Строй»']
  },
  {
    subcategoryId: 'stretch_ceilings',
    subcategoryName: 'Натяжные потолки',
    categoryId: 'construction',
    categoryName: 'Ремонт и Мебель',
    categoryEmoji: '🔨',
    names: ['Натяжные потолки «Престиж»', 'Потолочные системы «Sky Line»', 'Потолки под ключ «Глянец»']
  },

  // Tourism & Recreation
  {
    subcategoryId: 'agrotourism',
    subcategoryName: 'Агроусадьбы и загородные дома',
    categoryId: 'tourism',
    categoryName: 'Отдых и Туризм',
    categoryEmoji: '🌲',
    names: ['Усадьба у озера «Лесная Сказка»', 'Агроусадьба «Тихий Уголок»', 'Загородный комплекс «Хуторок»', 'Гостевой дом «Сосновый Бор»', 'Усадьба «Уютная Заводь»']
  },
  {
    subcategoryId: 'saunas_baths',
    subcategoryName: 'Бани, сауны и чаны',
    categoryId: 'tourism',
    categoryName: 'Отдых и Туризм',
    categoryEmoji: '🌲',
    names: ['Баня на дровах «Парной Дворик»', 'Банный комплекс с чаном «Русский Пар»', 'Сауна & Бассейн «Релакс»', 'Баня с купелью «Дубрава»']
  },

  // Services
  {
    subcategoryId: 'cleaning',
    subcategoryName: 'Клининг квартир и офисов',
    categoryId: 'services',
    categoryName: 'Локальные услуги',
    categoryEmoji: '✨',
    names: ['Клининговая служба «Чистый Дом»', 'Клининг после ремонта «Кристалл»', 'Химчистка мебели и клининг «EcoClean»', 'Клининговая компания «Мята»']
  },

  // Medicine
  {
    subcategoryId: 'stomatology',
    subcategoryName: 'Стоматологические клиники',
    categoryId: 'medicine',
    categoryName: 'Медицина и Здоровье',
    categoryEmoji: '🦷',
    names: ['Стоматологический кабинет «Белый Жемчуг»', 'Клиника эстетической стоматологии «Dent Art»', 'Стоматология «Улыбка»', 'Стоматологический центр «Дента Про»']
  },

  // Education / Sport
  {
    subcategoryId: 'fitness_yoga',
    subcategoryName: 'Фитнес-клубы, йога и растяжка',
    categoryId: 'education_sport',
    categoryName: 'Обучение и Спорт',
    categoryEmoji: '💪',
    names: ['Студия стретчинга и йоги «Air Yoga»', 'Фитнес-студия «Body Shape»', 'Студия пилатеса «Баланс»', 'Женский фитнес «Fit Lady»']
  }
];

function generateSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20);
}

export function generateAllLeads() {
  const result: any[] = [];
  let idCounter = 1;

  for (const [cityIdStr, cityData] of Object.entries(CITY_TEMPLATES)) {
    const cityId = parseInt(cityIdStr, 10);

    for (const niche of NICHES) {
      // Pick 1-2 random businesses for this niche in this city
      const name = niche.names[cityId % niche.names.length];
      const street = cityData.streets[idCounter % cityData.streets.length];
      const house = (idCounter % 85) + 1;
      const address = `${street}, ${house}`;

      const phoneNum = Math.floor(1000000 + Math.random() * 9000000);
      const phonePrimary = `${cityData.phoneCode}${phoneNum}`;

      const cleanPhone = phonePrimary.replace(/[^0-9]/g, '');
      const slugName = generateSlug(name.replace(/[^а-яa-z0-9]/gi, ''));
      const instagram = `${slugName}_${cityData.name.toLowerCase().slice(0, 4)}`;
      const hasTg = Math.random() > 0.4;
      const telegram = hasTg ? `${slugName}_bot` : '';
      const tgLink = hasTg ? `https://t.me/${telegram}` : `https://t.me/+${cleanPhone}`;

      const rating = parseFloat((4.4 + Math.random() * 0.6).toFixed(1));
      const reviewsCount = Math.floor(25 + Math.random() * 280);

      // Raw website is social link or taplink or empty -> rule: hasRealWebsite = false
      const rawSites = [
        `https://instagram.com/${instagram}`,
        `https://taplink.cc/${instagram}`,
        `https://vk.com/${instagram}`,
        ''
      ];
      const rawWebsite = rawSites[idCounter % rawSites.length];

      result.push({
        id: idCounter,
        externalId: `${cityData.name.toLowerCase()}_${idCounter}_${niche.subcategoryId}`,
        countryId: cityData.countryId,
        cityId,
        cityName: cityData.name,
        subcategoryId: niche.subcategoryId,
        subcategoryName: niche.subcategoryName,
        categoryId: niche.categoryId,
        categoryName: niche.categoryName,
        categoryEmoji: niche.categoryEmoji,
        name: `${name} ${cityData.name !== 'Минск' && cityData.name !== 'Москва' ? cityData.name : ''}`.trim(),
        address,
        lat: 53.9 + (Math.random() - 0.5) * 0.3,
        lon: 27.5 + (Math.random() - 0.5) * 0.3,
        rating,
        reviewsCount,
        rawWebsite,
        hasRealWebsite: false,
        phonePrimary,
        instagram,
        telegram,
        tgLink,
        phoneLink: `tel:${phonePrimary}`,
        source: idCounter % 2 === 0 ? 'yandex' : '2gis',
        crmStatus: idCounter % 15 === 0 ? 'contacted' : idCounter % 25 === 0 ? 'in_progress' : 'new'
      });

      idCounter++;
    }
  }

  return result;
}

const leads = generateAllLeads();
console.log(`Generated ${leads.length} leads across 22 cities!`);

// Write to staticLeads.ts
const staticLeadsPath = path.resolve(__dirname, '../../../webapp/src/data/staticLeads.ts');
const fileContent = `export const STATIC_LEADS = ${JSON.stringify(leads, null, 2)};\n`;
fs.writeFileSync(staticLeadsPath, fileContent, 'utf-8');
console.log(`Updated ${staticLeadsPath}`);

// Also populate SQLite database
import { DatabaseSync } from 'node:sqlite';
const dbPath = path.resolve(__dirname, '../../../backend/data/leadgen.sqlite');
if (fs.existsSync(dbPath)) {
  const db = new DatabaseSync(dbPath);
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO leads (
      external_id, country_id, city_id, subcategory_id, name, address,
      lat, lon, rating, reviews_count, raw_website, has_real_website,
      phone_primary, instagram, telegram, vk, source, crm_status
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )
  `);

  let added = 0;
  for (const l of leads) {
    try {
      insertStmt.run(
        l.externalId, l.countryId, l.cityId, l.subcategoryId, l.name, l.address,
        l.lat, l.lon, l.rating, l.reviewsCount, l.rawWebsite, l.hasRealWebsite ? 1 : 0,
        l.phonePrimary, l.instagram, l.telegram, '', l.source, l.crmStatus
      );
      added++;
    } catch (e: any) {
      console.error(e.message);
    }
  }
  console.log(`Updated SQLite database with ${added} organizations!`);
}
