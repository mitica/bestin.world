import type { InsightInfo, CountryInfo } from "../content/common/types";

type Props = {
  insights: (InsightInfo & { countryId: string })[];
  countries: CountryInfo[];
  limit?: number;
};

export function bestWorstCountries({
  insights,
  countries,
  limit = 510
}: Props) {
  const bestInsights = insights.filter((insight) => insight.type === "GOOD");
  const worstInsights = insights.filter((insight) => insight.type === "BAD");
  const bestCountries = bestInsights.reduce((acc, insight) => {
    const countryId = insight.countryId;
    if (!acc[countryId]) {
      acc[countryId] = [];
    }
    acc[countryId].push(insight);
    return acc;
  }, {} as Record<string, (typeof bestInsights)[0][]>);
  const getCountry = (id: string) => {
    return countries.find((country) => country.id === id);
  };
  const countIndicators = (items: (typeof bestInsights)[0][]) =>
    items
      .map((item) => item.indicatorIds.length)
      .reduce((sum, count) => sum + count, 0);
  const count = (items: (typeof bestInsights)[0][]) =>
    items.length + countIndicators(items) / 2;

  const TopBestCountries = Object.entries(bestCountries)
    .sort(([, a], [, b]) => count(b) - count(a))
    .slice(0, limit)
    .map(([countryId, insights]) => ({
      country: getCountry(countryId)!,
      insights
    }));

  const worstCountries = worstInsights.reduce((acc, insight) => {
    const countryId = insight.countryId;
    if (!acc[countryId]) {
      acc[countryId] = [];
    }
    acc[countryId].push(insight);
    return acc;
  }, {} as Record<string, (typeof worstInsights)[0][]>);
  const TopWorstCountries = Object.entries(worstCountries)
    .sort(([, a], [, b]) => count(b) - count(a))
    .slice(0, limit)
    .map(([countryId, insights]) => ({
      country: getCountry(countryId)!,
      insights
    }));

  return {
    Best: TopBestCountries,
    Worst: TopWorstCountries
  };
}
