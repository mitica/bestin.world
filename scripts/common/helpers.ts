import { glob, readFile } from "fs/promises";
import type {
  CountryInfo,
  IndicatorCountryRankValue,
  IndicatorCountryValue,
  IndicatorInfo,
  InsightInfo,
  LanguageInfo,
  TopicInfo
} from "../../src/content/common/types";
import twemoji from "twemoji";

export const getEmojiSvg = async (emoji: string) => {
  const code = twemoji.convert.toCodePoint(emoji);
  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji/assets/svg/${code}.svg`;
  const res = await fetch(url);
  return await res.text();
};

export const readCountryInsights = async (country = "*") => {
  const f = `src/content/country/${country}/insights.json`;
  const list: (InsightInfo & { countryId: string })[] = [];
  for await (const entry of glob(f)) {
    const countryId = /[\\/]country[\\/]([^/]+)[\\/]/.exec(entry)?.[1] || "";
    if (!countryId) throw new Error(`Country ID not found in path: ${entry}`);
    const data = await readFile(entry, "utf-8");
    list.push(
      ...JSON.parse(data).map((item: InsightInfo) => ({
        ...item,
        countryId: countryId.toLowerCase()
      }))
    );
  }
  return list;
};

export const readIndicatorRanks = async (indicators: string[] = []) => {
  const f = `src/content/indicator/*/rank.json`;
  const list: IndicatorCountryRankValue[] = [];
  for await (const entry of glob(f)) {
    const indicatorId =
      /[\\/]indicator[\\/]([^/]+)[\\/]/.exec(entry)?.[1] || "";
    if (!indicatorId)
      throw new Error(`Indicator ID not found in path: ${entry}`);
    if (indicators.length && !indicators.includes(indicatorId)) continue;
    const data = await readFile(entry, "utf-8");
    list.push(...JSON.parse(data));
  }
  return list;
};

let countries: CountryInfo[];

export const getCountries = async () => {
  if (countries) return countries;

  countries = await readFile("src/content/common/countries.json", "utf-8").then(
    (data) => JSON.parse(data)
  );
  return countries;
};

let indicators: IndicatorInfo[];

export const getIndicators = async (fresh = false) => {
  if (indicators && !fresh) return indicators;
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

const wbIndicators: Record<string, IndicatorCountryValue[]> = {};

export const getWBIndicatorData = async (indicator: IndicatorInfo) => {
  if (wbIndicators[indicator.id]) return wbIndicators[indicator.id];
  const data: {
    country: { id: string };
    date: string;
    value: string | null;
    decimal: number;
  }[] = await readFile(
    `data/wb/wb-indicator-${indicator.idWorldBank}.json`,
    "utf-8"
  ).then((data) => JSON.parse(data));
  wbIndicators[indicator.id] = data
    .filter((item) => !!item.date && !!item.value && item.value !== "null")
    .map<IndicatorCountryValue>((item) => ({
      countryId: item.country.id.toString().toLowerCase(),
      date: parseInt(item.date.substring(0, 4), 10),
      value: parseFloat(item.value || ""),
      decimal: item.decimal,
      indicatorId: indicator.id,
      type: "average" // Default type, can be changed later
    }));

  return wbIndicators[indicator.id];
};

const hdrIndicators: Record<string, IndicatorCountryValue[]> = {};

export const getHDRIndicatorData = async (indicator: IndicatorInfo) => {
  if (hdrIndicators[indicator.id]) return hdrIndicators[indicator.id];
  const countries = await getCountries();
  const data: {
    country: string;
    countryIsoCode: string;
    indexCode: string;
    index: string;
    indicatorCode: string;
    indicator: string;
    value: string;
    note: string;
    year: string;
  }[] = await readFile(`data/hdr-data.json`, "utf-8").then((data) =>
    JSON.parse(data)
  );
  hdrIndicators[indicator.id] = data
    .filter(
      (item) =>
        !!item.year &&
        !!item.value &&
        item.value !== "null" &&
        item.indicatorCode === indicator.idHDR
    )
    .map<IndicatorCountryValue>((item) => ({
      countryId:
        countries
          .find(
            (country) =>
              country.cca3?.toLowerCase() === item.countryIsoCode.toLowerCase()
          )
          ?.id.toLowerCase() || "",
      date: parseInt(item.year, 10),
      value: parseFloat(item.value || ""),
      indicatorId: indicator.id,
      decimal: 0,
      type: "average" // Default type, can be changed later
    }))
    .filter((it) => it.countryId);

  return hdrIndicators[indicator.id];
};

export const getIndicatorData = async (indicator: IndicatorInfo) => {
  if (indicator.idWorldBank) {
    return getWBIndicatorData(indicator);
  } else if (indicator.idHDR) {
    return getHDRIndicatorData(indicator);
  } else {
    throw new Error("Unknown indicator type");
  }
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

export const getLastHDRIndicatorData = async (indicator: IndicatorInfo) => {
  const data = await getHDRIndicatorData(indicator);
  const year = new Date().getFullYear();
  const latestByCountry = data.reduce((acc, item) => {
    if (!acc[item.countryId] && item.date >= year - 10) {
      acc[item.countryId] = item;
    }
    return acc;
  }, {} as Record<string, (typeof data)[0]>);
  return Object.values(latestByCountry);
};

export const getLastIndicatorData = async (indicator: IndicatorInfo) => {
  if (indicator.idWorldBank) {
    return getLastWBIndicatorData(indicator);
  } else if (indicator.idHDR) {
    return getLastHDRIndicatorData(indicator);
  } else {
    throw new Error("Unknown indicator type");
  }
};
