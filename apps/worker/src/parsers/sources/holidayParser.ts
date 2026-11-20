import { RawLead } from '../types.js';
import { normalizeTitle, normalizeAddress, normalizePhone } from '../normalizer.js';

const BASE_URL = 'https://www.holiday.by';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

interface HolidayNicheConfig {
  path: string;
  subcategoryId: string;
  categoryName: string;
  categoryEmoji: string;
}

const HOLIDAY_NICHES: Record<string, HolidayNicheConfig> = {
  estates: {
    path: '/by/dom/estates',
    subcategoryId: 'agrotourism',
    categoryName: 'Усадьбы и агротуризм',
    categoryEmoji: '🌲',
  },
  sauna: {
    path: '/by/dom/sauna',
    subcategoryId: 'saunas_baths',
    categoryName: 'Бани, сауны и чаны',
    categoryEmoji: '🧖‍♂️',
  },
  camping: {
    path: '/by/dom/camping',
    subcategoryId: 'glamping',
    categoryName: 'Глэмпинги и кемпинги',
    categoryEmoji: '⛺',
  },
  cottages: {
    path: '/by/dom/cottages',
    subcategoryId: 'cottages_rent',
    categoryName: 'Коттеджи на сутки',
    categoryEmoji: '🏡',
  },
};

export async function parseHolidayBy(nicheKey: string = 'estates', maxPages: number = 1): Promise<RawLead[]> {
  const config = HOLIDAY_NICHES[nicheKey] || HOLIDAY_NICHES.estates;
  const itemUrls = new Set<string>();

  for (let p = 1; p <= maxPages; p++) {
    const pageUrl = `${BASE_URL}${config.path}?p=${p}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(pageUrl, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) break;
      const html = await res.text();

      const matches = [...html.matchAll(/href="(\/by\/dom\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)"/g)].map(m => m[1]);
      const valid = matches.filter(l => !l.includes('/photo') && !l.includes('/opinions') && !l.includes('/services'));
      valid.forEach(u => itemUrls.add(u));
    } catch (e: any) {
      console.warn(`[Holiday.by] Страница ${p}: ${e.message}`);
    }
  }

  const list = [...itemUrls].slice(0, 10); // Limit to top 10 items per run to avoid throttling
  console.log(`[Holiday.by] Ссылок на объекты найдено: ${list.length}. Сбор прямых контактов...`);

  const results: RawLead[] = [];

  for (let i = 0; i < list.length; i++) {
    const relUrl = list[i];
    const fullUrl = BASE_URL + relUrl;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(fullUrl, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const html = await res.text();

      const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const rawTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const title = normalizeTitle(rawTitle);
      if (!title) continue;

      const locMatch = html.match(/class="location-block-place__link">([^<]+)<\/a>/i);
      const rawRegion = locMatch ? locMatch[1].trim() : 'Беларусь';

      const phoneMatches = [...html.matchAll(/href="tel:([^"]+)"/g)].map(m => normalizePhone(m[1].trim()));
      const uniquePhones = [...new Set(phoneMatches.filter(p => p.length >= 10))];
      if (uniquePhones.length === 0) continue;

      const siteMatch = html.match(/href="(https?:\/\/[^"]+)"[^>]*rel="[^"]*nofollow[^"]*"[^>]*>([^<]*сайт[^<]*|перейти[^<]*)<\/a>/i);
      const rawWebsite = siteMatch ? siteMatch[1] : '';

      // Determine city
      let cityId = 1;
      let cityName = 'Минск и область';
      if (rawRegion.includes('Брест')) { cityId = 2; cityName = 'Брест'; }
      else if (rawRegion.includes('Гродн')) { cityId = 3; cityName = 'Гродно'; }
      else if (rawRegion.includes('Гомел')) { cityId = 4; cityName = 'Гомель'; }
      else if (rawRegion.includes('Витеб')) { cityId = 5; cityName = 'Витебск'; }
      else if (rawRegion.includes('Могил')) { cityId = 6; cityName = 'Могилев'; }

      const slug = relUrl.split('/').pop() || title.toLowerCase().slice(0, 25);

      results.push({
        externalId: `holiday_${slug}`,
        countryId: 'BY',
        cityId,
        cityName,
        subcategoryId: config.subcategoryId,
        categoryName: config.categoryName,
        categoryEmoji: config.categoryEmoji,
        name: title,
        address: normalizeAddress(rawRegion),
        phonePrimary: uniquePhones[0],
        phonesExtra: uniquePhones.slice(1),
        rawWebsite,
        source: 'holiday',
        sourceUrl: fullUrl,
      });

      console.log(` • [${i + 1}/${list.length}] ${title} (${cityName}) → ${uniquePhones[0]}`);
      await new Promise(r => setTimeout(r, 100));
    } catch (err: any) {
      console.warn(`[Holiday.by] Ошибка парсинга ${fullUrl}: ${err.message}`);
    }
  }

  return results;
}
