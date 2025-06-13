import { readFile } from "fs/promises";
import type {
  CountryInfo,
  IndicatorInfo,
  LanguageInfo,
  TopicInfo
} from "../../src/content/common/types";

export const getCountries = async () => {
  const countries = await readFile(
    "src/content/common/countries.json",
    "utf-8"
  ).then((data) => JSON.parse(data));
  return countries as CountryInfo[];
};

export const getIndicators = async () => {
  const indicators = await readFile(
    "src/content/common/indicators.json",
    "utf-8"
  ).then((data) => JSON.parse(data));
  return indicators as IndicatorInfo[];
};

export const getTopics = async () => {
  const topics = await readFile(
    "src/content/common/topics.json",
    "utf-8"
  ).then((data) => JSON.parse(data));
  return topics as TopicInfo[];
};

export const getLanguages = async () => {
  const languages = await readFile(
    "src/content/common/languages.json",
    "utf-8"
  ).then((data) => JSON.parse(data));
  return languages as LanguageInfo[];
};
