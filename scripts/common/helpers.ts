import { readFile } from "fs/promises";
import type {
  CountryInfo,
  IndicatorCountryValue,
  IndicatorInfo,
  LanguageInfo,
  TopicInfo
} from "../../src/content/common/types";

let countries: CountryInfo[];

export const getCountries = async () => {
  if (countries) return countries;

  countries = await readFile("src/content/common/countries.json", "utf-8").then(
    (data) => JSON.parse(data)
  );
  return countries;
};

let indicators: IndicatorInfo[];

export const getIndicators = async () => {
  if (indicators) return indicators;
  indicators = await readFile(
    "src/content/common/indicators.json",
    "utf-8"
  ).then((data) => JSON.parse(data));
  return indicators;
};

let topics: TopicInfo[];

export const getTopics = async () => {
  if (topics) return topics;
  topics = await readFile("src/content/common/topics.json", "utf-8").then(
    (data) => JSON.parse(data)
  );
  return topics;
};

let languages: LanguageInfo[];

export const getLanguages = async () => {
  if (languages) return languages;
  languages = await readFile("src/content/common/languages.json", "utf-8").then(
    (data) => JSON.parse(data)
  );
  return languages;
};

let wbIndicators: IndicatorCountryValue[];

export const getWBIndicatorData = async (indicator: IndicatorInfo) => {
  if (wbIndicators) return wbIndicators;
  const data: {
    country: { id: string };
    date: string;
    value: string | null;
    decimal: number;
  }[] = await readFile(
    `data/wb/wb-indicator-${indicator.idWorldBank}.json`,
    "utf-8"
  ).then((data) => JSON.parse(data));
  wbIndicators = data
    .filter((item) => !!item.date && !!item.value && item.value !== "null")
    .map<IndicatorCountryValue>((item) => ({
      countryId: item.country.id.toString().toLowerCase(),
      date: parseInt(item.date.substring(0, 4), 10),
      value: parseFloat(item.value || ""),
      decimal: item.decimal,
      indicatorId: indicator.id,
      type: "average" // Default type, can be changed later
    }));

  return wbIndicators;
};

/**
 * Get the last data point for a given indicator
 * for the latest year available grouped by country.
 */
export const getLastWBIndicatorData = async (indicator: IndicatorInfo) => {
  const data = await getWBIndicatorData(indicator);
  const year = new Date().getFullYear();
  const latestByCountry = data.reduce((acc, item) => {
    if (!acc[item.countryId] && item.date >= year - 10) {
      acc[item.countryId] = item;
    }
    return acc;
  }, {} as Record<string, (typeof data)[0]>);
  return Object.values(latestByCountry);
};
