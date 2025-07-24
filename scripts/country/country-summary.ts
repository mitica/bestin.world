import {
  getCountries,
  getIndicators,
  readIndicatorRanks,
  saveFileIfChanged
} from "../common/helpers";
import type { CountrySummary } from "../../src/content/common/types";
import { fileURLToPath } from "url";
import { MAIN_INDICATOR_IDS } from "../../src/config";

export async function generate() {
  const indicators = await getIndicators();
  const indicatorIds = indicators
    .filter((it) => MAIN_INDICATOR_IDS.includes(it.id))
    .map((it) => it.id);
  const countries = await getCountries();
  const ranks = await readIndicatorRanks();
  const results: CountrySummary[] = [];
  const fileName = `src/content/common/country-summary.json`;
  // const getIndicator = (id: string) => indicators.find((it) => it.id === id)!;
  for (const country of countries) {
    const countryRanks = ranks.filter(
      (rank) =>
        rank.countryId === country.id && indicatorIds.includes(rank.indicatorId)
    );
    if (countryRanks.length > 0) {
      results.push({
        countryId: country.id,
        rank: 0,
        points: countryRanks.reduce((sum, rank) => sum + rank.rank, 0),
        indicatorCount: countryRanks.length
      });
    }
  }
  results.sort(
    // (a, b) => a.points - b.points
    (a, b) => a.points / a.indicatorCount - b.points / b.indicatorCount
  );
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  await saveFileIfChanged(fileName, JSON.stringify(results, null, 2));
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generate();
}
