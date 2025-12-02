import {
  getCountries,
  getIndicators,
  readIndicatorRanks,
  readIndicatorRanksHistory,
  saveFileIfChanged
} from "../common/helpers";
import type { CountryRank } from "../../src/content/common/types";
import { fileURLToPath } from "url";
import { MAIN_INDICATOR_IDS } from "../../src/config";

export async function generate() {
  const indicators = await getIndicators();
  const indicatorIds = indicators
    .filter((it) => MAIN_INDICATOR_IDS.includes(it.id))
    .map((it) => it.id);

  const countries = await getCountries();
  const allRanks = await readIndicatorRanksHistory(indicatorIds);

  const results: CountryRank[] = [];
  const fileName = `src/content/common/country-rank.json`;

  // Get all unique years
  const years = [...new Set(allRanks.map((r) => r.year))].sort((a, b) => a - b);

  for (const year of years) {
    const yearRanks = allRanks.filter((r) => r.year === year);
    const yearResults: (CountryRank & { id: string })[] = [];

    for (const country of countries) {
      const countryRanks = yearRanks.filter(
        (rank) => rank.countryId === country.id
      );

      if (countryRanks.length > 0) {
        yearResults.push({
          id: `${country.id}-${year}`,
          countryId: country.id,
          year: year,
          rank: 0, // Will be set later
          points: countryRanks.reduce((sum, rank) => sum + rank.rank, 0),
          indicatorCount: countryRanks.length
        });
      }
    }

    // Sort by average rank (points / indicatorCount)
    yearResults.sort(
      (a, b) => a.points / a.indicatorCount - b.points / b.indicatorCount
    );

    // Assign rank
    yearResults.forEach((result, index) => {
      result.rank = index + 1;
    });

    results.push(...yearResults);
  }

  await saveFileIfChanged(fileName, JSON.stringify(results, null, 2));
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generate();
}
