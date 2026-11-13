/**
 * Determines whether a website field represents a real standalone website
 * or if it is merely a social media profile, messenger link, or multi-link page.
 */
export function isRealWebsite(rawUrl?: string | null): boolean {
  if (!rawUrl) return false;
  const url = rawUrl.trim().toLowerCase();
  if (url === '' || url === 'нет' || url === 'нет сайта' || url === 'none' || url === '-') return false;

  // Social networks
  if (url.includes('instagram.com') || url.includes('instagr.am')) return false;
  if (url.includes('vk.com') || url.includes('vk.ru')) return false;
  if (url.includes('facebook.com') || url.includes('fb.com')) return false;
  if (url.includes('ok.ru') || url.includes('odnoklassniki.ru')) return false;
  if (url.includes('tiktok.com')) return false;
  if (url.includes('youtube.com') || url.includes('t.me') || url.includes('telegram.me')) return false;
  if (url.includes('viber.com') || url.includes('wa.me') || url.includes('whatsapp.com')) return false;

  // Bio multi-link aggregators
  if (url.includes('taplink.cc') || url.includes('taplink.ws')) return false;
  if (url.includes('linktr.ee') || url.includes('mssg.me') || url.includes('msha.ke')) return false;

  // Map portals & aggregators
  if (url.includes('yandex.ru/maps') || url.includes('yandex.by/maps')) return false;
  if (url.includes('2gis.ru') || url.includes('2gis.by')) return false;
  if (url.includes('relax.by') || url.includes('holiday.by') || url.includes('zoon.ru')) return false;

  // If it has a standard domain extension and is not an aggregator, it's a real website
  return url.includes('.');
}
