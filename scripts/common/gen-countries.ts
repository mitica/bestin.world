import type {
  CountryInfo,
  CurrencyInfo,
  LanguageInfo
} from "../../src/content/common/types";
import countries from "../../data/countries.json";
import languagesContent from "../../src/content/common/languages.json";
import {
  getContinentInfo,
  getCountryContinent,
  slugify
} from "../../src/utils";
import { saveFileIfChanged } from "./helpers";
import { fileURLToPath } from "url";

export async function gen() {
  const result: CountryInfo[] = [];
  const allLanguages: Record<string, LanguageInfo> = Object.fromEntries(
    languagesContent.map((value) => [(value.cca3 || "").toLowerCase(), value])
  );

  for (const item of countries) {
    const id = item.cca2.toLowerCase();
    if (!item.independent) continue;
    if (["va"].includes(id)) continue;
    const continentCode = getCountryContinent(item.cca2);
    const code = item.cca2.toLowerCase();
    result.push({
      id,
      slug: slugify(item.name.common.trim().replace(/\scity$/, "")),
      name: item.name.common,
      commonName: item.name.common,
      officialName: item.name.official,
      code: code,
      cca2: item.cca2,
      ccn3: item.ccn3,
      cca3: item.cca3,
      cioc: item.cioc,
      continents: continentCode ? [getContinentInfo(continentCode)] : [],
      currencies: Object.entries(item.currencies || {}).map<CurrencyInfo>(
        ([code, currency]) => ({
          id: code.toLowerCase(),
          name: currency.name,
          code,
          commonName: currency.name,
          officialName: currency.name,
          symbol: currency.symbol
        })
      ),
      languages: Object.entries(item.languages || {})
        .map<LanguageInfo>(([code]) => allLanguages[code.toLowerCase()])
        .filter((it) => !!it),
      borderIds: item.borders
        .map(
          (c3) => countries.find((c) => c.cca3 === c3)?.cca2.toLowerCase() || ""
        )
        .filter(Boolean)
    });
  }

  const content = JSON.stringify(result, null, 2);
  await saveFileIfChanged("src/content/common/countries.json", content);
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  gen();
}
