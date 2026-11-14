import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { generateOffer } from './offerService.js';

export interface LeadExportRow {
  id: number;
  name: string;
  cityName: string;
  address: string;
  categoryName?: string;
  subcategoryId?: string;
  phonePrimary: string;
  instagram?: string;
  telegram?: string;
  vk?: string;
  hasRealWebsite: boolean | number;
  rating: number;
  reviewsCount: number;
  crmStatus: string;
}

export function generateExcelBuffer(leads: LeadExportRow[]): Buffer {
  const data = leads.map((l, index) => {
    const offer = generateOffer({
      id: l.id,
      name: l.name,
      cityName: l.cityName,
      categoryName: l.categoryName,
      subcategoryId: l.subcategoryId
    });

    return {
      '№': index + 1,
      'Название': l.name,
      'Город': l.cityName,
      'Адрес': l.address || '',
      'Категория': l.categoryName || '',
      'Телефон': l.phonePrimary || '',
      'Instagram': l.instagram ? (l.instagram.startsWith('http') ? l.instagram : `https://instagram.com/${l.instagram.replace('@', '')}`) : '',
      'Telegram': l.telegram ? `https://t.me/${l.telegram.replace('@', '')}` : (l.phonePrimary ? `https://t.me/+${l.phonePrimary.replace(/[^0-9]/g, '')}` : ''),
      'Ссылка на Яндекс Карты': `https://yandex.ru/maps/?text=${encodeURIComponent(l.cityName + ', ' + l.name + (l.address ? ', ' + l.address : ''))}`,
      'VK': l.vk || '',
      'Сайт': l.hasRealWebsite ? 'Есть сайт' : 'БЕЗ САЙТА (ЦЕЛЕВОЙ)',
      'Рейтинг': l.rating || '',
      'Отзывов': l.reviewsCount || 0,
      'CRM Статус': l.crmStatus === 'new' ? 'Новый' : l.crmStatus === 'contacted' ? 'Написали' : l.crmStatus === 'in_progress' ? 'В работе' : l.crmStatus === 'won' ? 'Сделка' : 'Отказ',
      'Оффер MoonWeb Lab': offer.messageText
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Column widths
  worksheet['!cols'] = [
    { wch: 4 },  // №
    { wch: 30 }, // Название
    { wch: 15 }, // Город
    { wch: 30 }, // Адрес
    { wch: 22 }, // Категория
    { wch: 18 }, // Телефон
    { wch: 25 }, // Instagram
    { wch: 25 }, // Telegram
    { wch: 20 }, // VK
    { wch: 24 }, // Сайт
    { wch: 8 },  // Рейтинг
    { wch: 10 }, // Отзывов
    { wch: 14 }, // CRM Статус
    { wch: 60 }  // Оффер MoonWeb Lab
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Лиды MoonWeb Lab');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}
