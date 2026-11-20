export type LeadSource = 'holiday' | 'osm' | 'yandex' | '2gis' | 'manual';

export interface RawLead {
  externalId: string;
  countryId: 'BY' | 'RU';
  cityId: number;
  cityName: string;
  subcategoryId: string;
  categoryName?: string;
  categoryEmoji?: string;
  name: string;
  address?: string;
  lat?: number;
  lon?: number;
  rating?: number;
  reviewsCount?: number;
  rawWebsite?: string;
  phonePrimary: string;
  phonesExtra?: string[];
  instagram?: string;
  telegram?: string;
  vk?: string;
  source: LeadSource;
  sourceUrl?: string;
}

export interface ParsedLead extends RawLead {
  hasRealWebsite: boolean;
}

export interface ParserRunStats {
  source: string;
  totalFound: number;
  targetLeadsWithoutWebsite: number;
  savedNew: number;
  updatedExisting: number;
  errorsCount: number;
  durationMs: number;
}
