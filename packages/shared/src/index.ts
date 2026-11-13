// ==========================================
// MOONWEB LEADGEN SHARED TYPES
// ==========================================

export type CountryCode = 'BY' | 'RU';

export interface Country {
  id: CountryCode;
  name: string;
  flag: string;
}

export interface City {
  id: number;
  countryId: CountryCode;
  name: string;
  region?: string;
  isMajor?: boolean;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  sortOrder: number;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  searchQueries: string[];
}

export type CrmStatus = 'new' | 'contacted' | 'in_progress' | 'rejected' | 'won';

export interface Lead {
  id: number;
  externalId?: string;
  countryId: CountryCode;
  cityId: number;
  cityName: string;
  subcategoryId?: string;
  categoryName?: string;
  categoryEmoji?: string;
  name: string;
  address: string;
  lat?: number;
  lon?: number;
  rating: number;
  reviewsCount: number;
  rawWebsite?: string;
  hasRealWebsite: boolean; // false = NO WEBSITE (Target Lead!)
  phonePrimary: string;
  phonesExtra?: string[];
  instagram?: string;
  telegram?: string;
  vk?: string;
  source: 'yandex' | '2gis' | 'holiday' | 'manual';
  sourceUrl?: string;
  crmStatus: CrmStatus;
  crmNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed action links
  tgLink?: string;
  viberLink?: string;
  phoneLink?: string;
}

export interface LeadFilterParams {
  countryId?: CountryCode;
  cityId?: number | string;
  categoryId?: string;
  subcategoryId?: string;
  onlyNoWebsite?: boolean;
  hasInstagram?: boolean;
  hasTelegram?: boolean;
  hasPhone?: boolean;
  minRating?: number;
  crmStatus?: CrmStatus | 'all';
  search?: string;
  sortBy?: 'reviews' | 'rating' | 'name' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  metrics: {
    totalCount: number;
    noWebsiteCount: number;
    hasInstagramCount: number;
    hasTelegramCount: number;
  };
}

export interface GeneratedOffer {
  leadId: number;
  businessName: string;
  city: string;
  niche: string;
  messageText: string;
  keyHooks: string[];
  suggestedAction: string;
}
