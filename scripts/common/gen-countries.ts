import { readFile, writeFile } from "fs/promises";
import type {
  CountryInfo,
  CurrencyInfo,
  LanguageInfo
} from "../../src/content/common/types";

import countries from "../../data/countries.json";
import languagesContent from "../../src/content/common/languages.json";

async function gen() {
  const result: CountryInfo[] = [];
  const allLanguages: Record<string, LanguageInfo> = Object.fromEntries(
    languagesContent.map((value) => [(value.cca3 || "").toLowerCase(), value])
  );

  for (const item of countries) {
    if (!item.independent) continue;
    const id = item.cca2.toLowerCase();
    const code = item.cca2.toLowerCase();
    result.push({
      id,
      name: item.name.common,
      commonName: item.name.common,
      officialName: item.name.official,
      code: code,
      cca2: item.cca2,
      ccn3: item.ccn3,
      cca3: item.cca3,
      cioc: item.cioc,
      continents: [],
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
        .filter((it) => !!it)
    });
  }

  const content = JSON.stringify(result, null, 2);
  await writeFile("src/content/common/countries.json", content, "utf-8");
}

gen().then(() => console.log("Countries generated successfully"));
