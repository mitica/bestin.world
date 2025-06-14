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
  sort: number;
  topicIds: string[];
}

export interface IndicatorCountryValue {
  countryId: string;
  indicatorId: string;
  date: number;
  value: number;
  decimal?: number;
  type: "max" | "min" | "average";
}

export interface InsightInfo {
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
