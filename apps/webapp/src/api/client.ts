import { STATIC_COUNTRIES, STATIC_CITIES, STATIC_CATEGORIES } from '../data/staticCatalog';
import { STATIC_LEADS } from '../data/staticLeads';
import { generateClientOffer } from '../services/clientOfferService';
import * as XLSX from 'xlsx';

export interface FilterState {
  countryId: 'BY' | 'RU';
  cityId: number | '';
  categoryId: string;
  subcategoryId: string;
  onlyNoWebsite: boolean;
  hasInstagram: boolean;
  hasTelegram: boolean;
  hasPhone: boolean;
  minRating: number | '';
  crmStatus: string;
  search: string;
  sortBy: 'reviews' | 'rating' | 'name' | 'newest';
  page: number;
  limit: number;
}

// LocalStorage key for storing CRM status changes
const CRM_STORAGE_KEY = 'moonweb_crm_statuses';

function getStoredCrmStatuses(): Record<number, string> {
  try {
    const raw = localStorage.getItem(CRM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCrmStatusLocally(leadId: number, status: string) {
  try {
    const stored = getStoredCrmStatuses();
    stored[leadId] = status;
    localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(stored));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const api = {
  async getCountries() {
    try {
      const res = await fetch('/api/catalog/countries');
      if (res.ok) return await res.json();
    } catch {}
    return STATIC_COUNTRIES;
  },

  async getCities(countryId?: string) {
    try {
      const url = countryId ? `/api/catalog/cities?countryId=${countryId}` : '/api/catalog/cities';
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {}
    if (countryId) {
      return STATIC_CITIES.filter(c => c.country_id === countryId);
    }
    return STATIC_CITIES;
  },

  async getCategories() {
    try {
      const res = await fetch('/api/catalog/categories');
      if (res.ok) return await res.json();
    } catch {}
    return STATIC_CATEGORIES;
  },

  async getStats() {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) return await res.json();
    } catch {}
    return {
      total: STATIC_LEADS.length,
      noWebsite: STATIC_LEADS.filter(l => !l.hasRealWebsite).length
    };
  },

  async getLeads(filters: FilterState) {
    // 1. Try server API
    try {
      const params = new URLSearchParams();
      if (filters.countryId) params.append('countryId', filters.countryId);
      if (filters.cityId) params.append('cityId', filters.cityId.toString());
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.subcategoryId) params.append('subcategoryId', filters.subcategoryId);
      if (filters.onlyNoWebsite) params.append('onlyNoWebsite', 'true');
      if (filters.hasInstagram) params.append('hasInstagram', 'true');
      if (filters.hasTelegram) params.append('hasTelegram', 'true');
      if (filters.hasPhone) params.append('hasPhone', 'true');
      if (filters.minRating) params.append('minRating', filters.minRating.toString());
      if (filters.crmStatus && filters.crmStatus !== 'all') params.append('crmStatus', filters.crmStatus);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // 2. Seamless local fallback (for GitHub Pages & offline)
    const storedCrm = getStoredCrmStatuses();

    let filtered = STATIC_LEADS.map(lead => ({
      ...lead,
      crmStatus: storedCrm[lead.id] || lead.crmStatus || 'new'
    }));

    if (filters.countryId) {
      filtered = filtered.filter(l => l.countryId === filters.countryId);
    }
    if (filters.cityId) {
      filtered = filtered.filter(l => l.cityId === filters.cityId);
    }
    if (filters.subcategoryId) {
      filtered = filtered.filter(l => l.subcategoryId === filters.subcategoryId);
    } else if (filters.categoryId) {
      filtered = filtered.filter(l => l.categoryId === filters.categoryId);
    }
    if (filters.onlyNoWebsite) {
      filtered = filtered.filter(l => !l.hasRealWebsite);
    }
    if (filters.hasInstagram) {
      filtered = filtered.filter(l => Boolean(l.instagram));
    }
    if (filters.hasTelegram) {
      filtered = filtered.filter(l => Boolean(l.telegram));
    }
    if (filters.hasPhone) {
      filtered = filtered.filter(l => Boolean(l.phonePrimary));
    }
    if (filters.minRating) {
      filtered = filtered.filter(l => l.rating >= (filters.minRating as number));
    }
    if (filters.crmStatus && filters.crmStatus !== 'all') {
      filtered = filtered.filter(l => l.crmStatus === filters.crmStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(q) ||
        (l.address && l.address.toLowerCase().includes(q)) ||
        (l.phonePrimary && l.phonePrimary.includes(q))
      );
    }

    // Sort
    if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    } else if (filters.sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'newest') {
      filtered.sort((a, b) => b.id - a.id);
    } else {
      filtered.sort((a, b) => b.reviewsCount - a.reviewsCount);
    }

    const total = filtered.length;
    const offset = (filters.page - 1) * filters.limit;
    const data = filtered.slice(offset, offset + filters.limit);

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit)
    };
  },

  async updateLeadCrm(leadId: number, crmStatus: string, crmNotes?: string) {
    saveCrmStatusLocally(leadId, crmStatus);
    try {
      await fetch(`/api/leads/${leadId}/crm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crmStatus, crmNotes })
      });
    } catch {}
    return { success: true, id: leadId, status: crmStatus };
  },

  async getOffer(leadId: number) {
    try {
      const res = await fetch(`/api/leads/${leadId}/offer`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {}

    const lead = STATIC_LEADS.find(l => l.id === leadId);
    if (!lead) throw new Error('Lead not found');

    return generateClientOffer({
      id: lead.id,
      name: lead.name,
      cityName: lead.cityName,
      categoryName: lead.categoryName,
      subcategoryId: lead.subcategoryId,
      phonePrimary: lead.phonePrimary,
      instagram: lead.instagram,
      rating: lead.rating
    });
  },

  async exportToTelegram(chatId: number | string, filters: any) {
    const res = await fetch('/api/export/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, filters })
    });
    if (!res.ok) throw new Error('Ошибка отправки файла в Telegram (требуется подключенный бэкенд)');
    return res.json();
  },

  async downloadExcel(filters: any) {
    try {
      const res = await fetch('/api/export/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MoonWeb_Leads_${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch {}

    // Fallback: Generate Excel right inside the browser via SheetJS
    const res = await this.getLeads({
      ...filters,
      page: 1,
      limit: 1000
    });

    const leads = res.data;
    const rows = leads.map((l: any) => ({
      'ID': l.id,
      'Название компании': l.name,
      'Город': l.cityName,
      'Адрес': l.address,
      'Категория': l.categoryName,
      'Рейтинг': l.rating,
      'Количество отзывов': l.reviewsCount,
      'Без сайта': l.hasRealWebsite ? 'НЕТ' : 'ДА (ЦЕЛЕВОЙ)',
      'Телефон': l.phonePrimary,
      'Instagram': l.instagram ? (l.instagram.startsWith('http') ? l.instagram : `https://instagram.com/${l.instagram}`) : '',
      'Telegram': l.telegram,
      'Ссылка на диалог Telegram': l.tgLink,
      'Ссылка на Яндекс Карты': l.yandexMapsUrl || `https://yandex.ru/maps/?text=${encodeURIComponent(l.cityName + ', ' + l.name + (l.address ? ', ' + l.address : ''))}`,
      'Статус в CRM': l.crmStatus,
      'Источник': l.source
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Лиды MoonWeb');
    XLSX.writeFile(workbook, `MoonWeb_Leads_${Date.now()}.xlsx`);
  }
};
