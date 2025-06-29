import { writeFile } from "fs/promises";
import {
  getCountries,
  getIndicators,
  getLastWBIndicatorData
} from "../common/helpers";
import type { IndicatorCountryValue } from "../../src/content/common/types";
import { createFolderIfNotExists } from "../../src/utils";
import { fileURLToPath } from "url";

async function genTopPerCountryAndIndicator() {
  const indicators = await getIndicators();
  const countryTops = new Map<string, IndicatorCountryValue[]>();
  const countries = await getCountries();
  const countryIds = countries.map((country) => country.id);
  for (const indicator of indicators) {
    const data = await getLastWBIndicatorData(indicator).then((values) =>
      values.filter((item) => countryIds.includes(item.countryId))
    );
    if (data.length === 0) continue;
    const maxValue = Math.max(...data.map((item) => item.value));
    const minValue = Math.min(...data.map((item) => item.value));
    if (maxValue === minValue) continue; // Skip if all values are the same
    let maxValues = data.filter((item) => item.value === maxValue);
    maxValues.forEach((item) => (item.type = "max"));
    if (maxValues.length > 5) maxValues = [];
    let minValues = data.filter((item) => item.value === minValue);
    minValues.forEach((item) => (item.type = "min"));
    if (minValues.length > 5) minValues = [];
    const countryCodes = [
      ...new Set(maxValues.concat(minValues).map((item) => item.countryId))
    ];
    for (const countryId of countryCodes) {
      if (!countryIds.includes(countryId)) continue; // Ensure the countryId is valid
      if (!countryTops.has(countryId)) {
        countryTops.set(countryId, []);
      }
      countryTops
        .get(countryId)
        ?.push(
          ...maxValues.filter((it) => it.countryId === countryId),
          ...minValues.filter((it) => it.countryId === countryId)
        );
    }
  }
  for (const [countryId, values] of countryTops) {
    const fileName = `src/content/country/${countryId}/top.json`;
    await createFolderIfNotExists(`src/content/country/${countryId}`);
    await writeFile(
      fileName,
      JSON.stringify(
        values.map((item) => ({
          indicatorId: item.indicatorId,
          value: item.value,
          date: item.date,
          type: item.type
        })),
        null,
        2
      )
    );
    console.log(`Generated ${fileName}`);
  }
}

export async function generate() {
  await genTopPerCountryAndIndicator()
    .then(() => console.log("Done generating top indicators per country."))
    .catch((error) => console.error("Error generating top indicators:", error));
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generate();
}
