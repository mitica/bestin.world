import type {
  CountryInfo,
  IndicatorCountryValue,
  IndicatorInfo,
  InsightInfo
} from "../../src/content/common/types";
import { getCountries, getIndicators } from "../common/helpers";
import { readFile, writeFile } from "fs/promises";
import { getCountryInsights } from "./helpers";
import { fileURLToPath } from "url";
import { createFolderIfNotExists, fileExists } from "../../src/utils";

const getValues = async (country: string) => {
  try {
    const content = await readFile(
      `src/content/country/${country}/top.json`,
      "utf-8"
    );
    const values = JSON.parse(content) as IndicatorCountryValue[];
    return values;
  } catch (error) {
    console.error(`Error reading top.json for ${country}:`, error);
    return [];
  }
};

const getInsights = async (
  country: CountryInfo,
  indicators: IndicatorInfo[],
  values: IndicatorCountryValue[]
): Promise<InsightInfo[]> => {
  if (values.length === 0) return [];
  const insights = await getCountryInsights({
    country: country.name,
    indicators: values.map((value) => {
      const indicator = indicators.find((ind) => ind.id === value.indicatorId);
      if (!indicator)
        throw new Error(`Indicator not found: ${value.indicatorId}`);
      return {
        id: value.indicatorId,
        type: value.type,
        name: indicator.name,
        value: value.value,
        year: value.date,
        wbid: indicator.idWorldBank!
      };
    })
  });

  getTopicIds(insights, indicators);

  return insights;
};

const getTopicIds = (
  insights: InsightInfo[],
  indicators: IndicatorInfo[]
): boolean => {
  let hasUpdates = false;
  insights.forEach((insight) => {
    const topicIds = Array.from(
      new Set(
        insight.indicatorIds
          .map((id) => {
            const indicator = indicators.find((ind) => ind.id === id);
            return indicator ? indicator.topicIds : [];
          })
          .flat()
      )
    );
    if (!insight.topicIds || insight.topicIds.length !== topicIds.length) {
      insight.topicIds = topicIds;
      hasUpdates = true;
    }
  });
  return hasUpdates;
};

export async function generate() {
  const countries = await getCountries();
  const indicators = await getIndicators();
  for (const country of countries) {
    const fileName = `src/content/country/${country.id}/insights.json`;
    let hasUpdates = false;
    let insights: InsightInfo[] | undefined = undefined;
    // if (await fileExists(fileName)) {
    //   const data = await readFile(fileName, "utf-8");
    //   const insightLocal: InsightInfo[] = JSON.parse(data);
    //   hasUpdates = getTopicIds(insightLocal, indicators);
    //   if (!hasUpdates) {
    //     console.log(
    //       `Insights file already exists for ${country.name} (${country.id}), skipping...`
    //     );
    //     continue;
    //   }
    //   insights = insightLocal;
    // }
    const values = await getValues(country.id);
    insights = insights || (await getInsights(country, indicators, values));
    await createFolderIfNotExists(`src/content/country/${country.id}`);
    await writeFile(fileName, JSON.stringify(insights, null, 2), "utf-8");
    console.log(
      `Generated insights for ${country.name} (${country.id}): ${insights.length} insights`
    );
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limiting
  }
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generate().catch((error) => {
    console.error("Error generating country insights:", error);
    process.exit(1);
  });
}
