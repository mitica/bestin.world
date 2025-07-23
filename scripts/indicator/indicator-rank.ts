import {
  getCountries,
  getIndicators,
  getLastIndicatorData,
  saveFileIfChanged
} from "../common/helpers";
import type { IndicatorCountryRankValue } from "../../src/content/common/types";
import { createFolderIfNotExists, isNumber } from "../../src/utils";
import { fileURLToPath } from "url";

export async function generate() {
  const indicators = await getIndicators();
  const countries = await getCountries();
  const countryIds = countries.map((country) => country.id);
  for (const indicator of indicators) {
    if (![1, -1].includes(indicator.sort as never)) {
      console.warn(
        `Skipping indicator ${indicator.id} (${indicator.name}) because it does not have a valid sort order.`
      );
      continue;
    }
    let values = await getLastIndicatorData(indicator);
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

    const fileName = `src/content/indicator/${indicator.id}/rank.json`;
    await createFolderIfNotExists(`src/content/indicator/${indicator.id}`);
    await saveFileIfChanged(fileName, JSON.stringify(result, null, 2));
    console.log(`Generated ${fileName}`);
  }
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generate();
}

