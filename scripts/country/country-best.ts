import { writeFile } from "fs/promises";
import { getIndicators, getLastWBIndicatorData } from "../common/helpers";
import type { IndicatorCountryValue } from "../../src/content/common/types";
import { createFolderIfNotExists } from "../../src/utils";

async function genTopPerCountryAndIndicator() {
  const indicators = await getIndicators();
  const countryTops = new Map<string, IndicatorCountryValue[]>();
  for (const indicator of indicators) {
    const data = await getLastWBIndicatorData(indicator);
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

genTopPerCountryAndIndicator()
  .then(() => console.log("Done generating top indicators per country."))
  .catch((error) => console.error("Error generating top indicators:", error));
