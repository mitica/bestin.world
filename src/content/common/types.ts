export type EntityNameData = {
  common: string;
  official: string;
};

export interface BaseEntityInfo {
  id: string;
  name: string;
  code: string;
  commonName?: string;
  officialName?: string;
}

export interface CountryInfo extends BaseEntityInfo {
  slug: string;
  cca2: string;
  ccn3?: string;
  cca3?: string;
  cioc?: string;
  continents: ContinentInfo[];
  currencies: CurrencyInfo[];
  languages: LanguageInfo[];
  borderIds: string[];
}

export interface ContinentInfo extends BaseEntityInfo {
  cca2: string;
  ccn3?: string;
  cca3?: string;
  cioc?: string;
}

export interface CurrencyInfo extends BaseEntityInfo {
  shmbol?: string;
}

export interface LanguageInfo extends BaseEntityInfo {
  cca3?: string;
  shmbol?: string;
  native?: string;
}

export interface IndicatorInfo extends BaseEntityInfo {
  idWorldBank?: string;
  idHDR?: string;
  sort?: number;
  unit?: string;
  topicIds: string[];
  valueInfo?: string;
  priority?: number;
  isComparable?: boolean;
  emoji?: string;
}

export interface IndicatorCountryValue {
  countryId: string;
  indicatorId: string;
  date: number;
  value: number;
  decimal?: number;
  type: "max" | "min" | "average";
}

export interface IndicatorCountryRankValue {
  countryId: string;
  indicatorId: string;
  date: number;
  value: number;
  decimal?: number;
  rank: number;
}

export interface InsightInfo {
  name: string;
  title: string;
  description: string;
  indicatorIds: string[];
  year: number;
  emoji: string;
  type: "GOOD" | "BAD";
  topicIds?: string[];
}

export interface TopicInfo {
  name: string;
  id: string;
  idWorldBank?: string;
}

export interface CountrySummaryData {
  countryId: string;
  rank: number;
  points: number;
  indicatorCount: number;
}

export interface CountrySummary extends CountrySummaryData {
  ranks: IndicatorCountryRankValue[];
}

export interface CountryRank extends CountrySummaryData {
  year: number;
}
