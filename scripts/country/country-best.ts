import { readFile, writeFile } from "fs/promises";
import { getCountries, getIndicators } from "../common/helpers";
import type {
  IndicatorCountryValue,
  IndicatorInfo
} from "../../src/content/common/types";
import { createFolderIfNotExists } from "../../src/utils";

export const getIndicatorData = async (indicator: IndicatorInfo) => {
  const data = await readFile(
    `data/wb/wb-indicator-${indicator.idWorldBank}.json`,
    "utf-8"
  ).then((data) => JSON.parse(data));
  return (
    data as {
      country: { id: string };
      date: string;
      value: string | null;
      decimal: number;
    }[]
  )
    .filter((item) => !!item.date && !!item.value && item.value !== "null")
    .map<IndicatorCountryValue>((item) => ({
      countryId: item.country.id.toString().toLowerCase(),
      date: parseInt(item.date.substring(0, 4), 10),
      value: parseFloat(item.value || ""),
      decimal: item.decimal,
      indicatorId: indicator.id,
      type: "average" // Default type, can be changed later
    }));
};

/**
 * Get the last data point for a given indicator
 * for the latest year available grouped by country.
 */
export const getLastIndicatorData = async (indicator: IndicatorInfo) => {
  const data = await getIndicatorData(indicator);
  const year = new Date().getFullYear();
  const latestByCountry = data.reduce((acc, item) => {
    if (!acc[item.countryId] && item.date >= year - 10) {
      acc[item.countryId] = item;
    }
    return acc;
  }, {} as Record<string, (typeof data)[0]>);
  return Object.values(latestByCountry);
};

async function genTopPerCountryAndIndicator() {
  const indicators = await getIndicators();
  const countryTops = new Map<string, IndicatorCountryValue[]>();
  for (const indicator of indicators) {
    const data = await getLastIndicatorData(indicator);
    if (data.length === 0) continue;
    const maxValue = Math.max(...data.map((item) => item.value));
    const minValue = Math.min(...data.map((item) => item.value));
    if (maxValue === minValue) continue; // Skip if all values are the same
    const maxValues = data.filter((item) => item.value === maxValue);
    maxValues.forEach((item) => (item.type = "max"));
    const minValues = data.filter((item) => item.value === minValue);
    minValues.forEach((item) => (item.type = "min"));
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
