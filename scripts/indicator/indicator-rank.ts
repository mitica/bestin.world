import {
  getCountries,
  getIndicators,
  getLastIndicatorData,
  saveFileIfChanged
} from "../common/helpers";
import type {
  CountryInfo,
  IndicatorCountryRankValue,
  IndicatorInfo
} from "../../src/content/common/types";
import { createFolderIfNotExists, isNumber } from "../../src/utils";
import { fileURLToPath } from "url";
import { CURRENT_YEAR, MAIN_INDICATOR_IDS } from "../../src/config";

export async function generate() {
  const indicators = await getIndicators();
  const countries = await getCountries();
  await generateLatestRanks(indicators, countries);
  await generateMainRanksHistory(
    indicators.filter((it) => MAIN_INDICATOR_IDS.includes(it.id)),
    countries
  );
}

async function generateLatestRanks(
  indicators: IndicatorInfo[],
  countries: CountryInfo[]
) {
  for await (const { indicator, data: result } of getRanks(
    indicators,
    countries,
    CURRENT_YEAR
  )) {
    const fileName = `src/content/indicator/${indicator.id}/rank.json`;
    await createFolderIfNotExists(`src/content/indicator/${indicator.id}`);
    await saveFileIfChanged(fileName, JSON.stringify(result, null, 2));
    console.log(`Generated ${fileName}`);
  }
}

async function generateMainRanksHistory(
  indicators: IndicatorInfo[],
  countries: CountryInfo[]
) {
  for (const indicator of indicators) {
    const data: IndicatorCountryRankValue[] = [];
    for (let year = 2010; year <= CURRENT_YEAR; year++) {
      for await (const { data: yearData } of getRanks(
        [indicator],
        countries,
        year
      )) {
        // reset year because I need it for chart
        yearData.forEach((item) => {
          (item as any).year = year;
        });
        data.push(...yearData);
      }
    }
    if (data.length === 0) {
      console.warn(
        `No rank data generated for indicator ${indicator.id}, skipping rank history file.`
      );
      continue;
    }
    const fileName = `src/content/indicator/${indicator.id}/rank-history.json`;
    await createFolderIfNotExists(`src/content/indicator/${indicator.id}`);
    await saveFileIfChanged(fileName, JSON.stringify(data, null, 2));
    console.log(`Generated ${fileName}`);
  }
}

async function* getRanks(
  indicators: IndicatorInfo[],
  countries: CountryInfo[],
  year: number
) {
  const countryIds = countries.map((country) => country.id);
  for (const indicator of indicators) {
    if (![1, -1].includes(indicator.sort as never)) {
      console.warn(
        `Skipping indicator ${indicator.id} (${indicator.name}) because it does not have a valid sort order.`
      );
      continue;
    }
    let values = await getLastIndicatorData(indicator, year);
    values = values.filter(
      (item) => countryIds.includes(item.countryId) && isNumber(item.value)
    );
    if (values.length === 0) {
      console.warn(
        `Skipping indicator ${indicator.id} (${indicator.name}) because it has no valid data.`
      );
      continue;
    }

    const result = (
      indicator.sort === 1
        ? values.sort((a, b) => b.value - a.value)
        : values.sort((a, b) => a.value - b.value)
    ).map<IndicatorCountryRankValue>((item, rank) => ({
      countryId: item.countryId,
      date: item.date,
      value: item.value,
      indicatorId: item.indicatorId,
      rank: rank + 1,
      decimal: item.decimal
    }));

    yield { indicator, data: result };
  }
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generate();
}
