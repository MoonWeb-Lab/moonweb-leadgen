import { isRealWebsite } from '../normalizers/websiteRule.js';
import { cleanPhone } from '../normalizers/phone.js';

export function normalizeTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/^[\s«"']+|[\s»"']+$/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeAddress(rawAddress?: string): string {
  if (!rawAddress) return '';
  return rawAddress
    .replace(/\s+/g, ' ')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim();
}

export function normalizePhone(rawPhone?: string): string {
  return cleanPhone(rawPhone);
}

export function checkHasRealWebsite(rawWebsite?: string | null): boolean {
  return isRealWebsite(rawWebsite);
}

export function extractInstagram(raw?: string): string {
  if (!raw) return '';
  const match = raw.match(/(?:instagram\.com\/|instagr\.am\/)?([a-zA-Z0-9._]+)/);
  if (match && match[1]) {
    const handle = match[1].toLowerCase().replace(/^@/, '');
    if (!['p', 'reel', 'stories', 'explore', 'direct'].includes(handle)) {
      return handle;
    }
  }
  return '';
}

export function extractTelegram(raw?: string): string {
  if (!raw) return '';
  const match = raw.match(/(?:t\.me\/|telegram\.me\/)?([a-zA-Z0-9_]+)/);
  if (match && match[1]) {
    return match[1].toLowerCase().replace(/^@/, '');
  }
  return '';
}
