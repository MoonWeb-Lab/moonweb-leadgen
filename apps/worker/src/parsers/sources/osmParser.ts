import { RawLead } from '../types.js';
import { normalizeTitle, normalizePhone, normalizeAddress, extractInstagram, extractTelegram } from '../normalizer.js';

interface CityBoundingBox {
  cityId: number;
  cityName: string;
  south: number;
  west: number;
  north: number;
  east: number;
}

const BY_CITIES: Record<string, CityBoundingBox> = {
  minsk: { cityId: 1, cityName: 'Минск', south: 53.82, west: 27.40, north: 53.97, east: 27.68 },
  brest: { cityId: 2, cityName: 'Брест', south: 52.05, west: 23.63, north: 52.16, east: 23.78 },
  grodno: { cityId: 3, cityName: 'Гродно', south: 53.62, west: 23.77, north: 53.72, east: 23.90 },
  gomel: { cityId: 4, cityName: 'Гомель', south: 52.38, west: 30.93, north: 52.48, east: 31.06 },
  vitebsk: { cityId: 5, cityName: 'Витебск', south: 55.15, west: 30.15, north: 55.24, east: 30.27 },
  mogilev: { cityId: 6, cityName: 'Могилев', south: 53.85, west: 30.27, north: 53.95, east: 30.40 },
};

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

export async function parseOsmLeads(cityKey: string = 'minsk', amenity: string = 'cafe', limit: number = 20): Promise<RawLead[]> {
  const city = BY_CITIES[cityKey] || BY_CITIES.minsk;
  const leads: RawLead[] = [];

  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="${amenity}"](${city.south},${city.west},${city.north},${city.east});
      node["shop"="${amenity}"](${city.south},${city.west},${city.north},${city.east});
    );
    out body ${limit};
  `.trim();

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MoonWeb-LeadHunter/1.0',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        continue;
      }

      const data: any = await response.json();
      const elements: any[] = data?.elements || [];

      for (const elem of elements) {
        const tags = elem.tags || {};
        const rawName = tags.name || tags['name:ru'] || tags['name:en'];
        if (!rawName) continue;

        const name = normalizeTitle(rawName);
        const rawPhone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || '';
        const phone = normalizePhone(rawPhone);

        // Raw website check
        const website = tags.website || tags['contact:website'] || '';

        const instagram = extractInstagram(tags['contact:instagram'] || tags.instagram || '');
        const telegram = extractTelegram(tags['contact:telegram'] || tags.telegram || '');

        const street = tags['addr:street'] || '';
        const housenumber = tags['addr:housenumber'] || '';
        const address = street ? `${street}${housenumber ? ', ' + housenumber : ''}` : city.cityName;

        let subcategoryId = 'coffee';
        let categoryName = 'HoReCa и Общепит';
        let categoryEmoji = '☕';

        if (amenity === 'hairdresser' || amenity === 'beauty') {
          subcategoryId = 'beauty_salon';
          categoryName = 'Салоны красоты и бьюти';
          categoryEmoji = '💅';
        } else if (amenity === 'car_repair' || amenity === 'car_wash') {
          subcategoryId = 'autoservice';
          categoryName = 'Автосервисы и детейлинг';
          categoryEmoji = '🚗';
        }

        leads.push({
          externalId: `osm_${elem.id}`,
          countryId: 'BY',
          cityId: city.cityId,
          cityName: city.cityName,
          subcategoryId,
          categoryName,
          categoryEmoji,
          name,
          address: normalizeAddress(address),
          lat: elem.lat,
          lon: elem.lon,
          rawWebsite: website,
          phonePrimary: phone,
          instagram,
          telegram,
          source: 'osm',
          sourceUrl: `https://www.openstreetmap.org/node/${elem.id}`,
        });
      }

      if (leads.length > 0) {
        console.log(`[OSM] Город: ${city.cityName}, категория: ${amenity} — получено ${leads.length} объектов.`);
        break;
      }
    } catch {
      // Try next mirror
    }
  }

  return leads;
}
