import { getCollection } from "astro:content";
import { MAIN_INDICATOR_IDS } from "../config";

const filterIndicator = (indicator: {
  id: string;
  name: string;
  commonName?: string;
  unit?: string;
}) => {
  return MAIN_INDICATOR_IDS.includes(indicator.id);
  // const text = [indicator.name, indicator.unit].filter(Boolean).join(" ");
  // return (
  //   /(\%|per\b|Per\b|Index|scale|days|years|rank|Rank|Bound)/.test(text) &&
  //   !/(LCU|Remittances|Estimate\b)/.test(text)
  // );
};

type Props = {
  id1: string;
  id2: string;
};

export const compareCountryIndicators = async ({ id1, id2 }: Props) => {
  const [indicatorRanks, indicators] = await Promise.all([
    getCollection("indicatorRanks"),
    getCollection("indicators")
  ]);

  const getIndicator = (id: string) => {
    return indicators.find((indicator) => indicator.id === id)!.data;
  };

  const year = new Date().getFullYear();

  const ranks = indicatorRanks
    .map((rank) =>
      rank.data
        .filter((it) => it.countryId === id1 || it.countryId === id2)
        .map((r) => ({
          ...r,
          indicatorId: rank.id,
          indicator: getIndicator(rank.id)
        }))
    )
    .flat()
    .filter((r) => r.date > year - 8 && filterIndicator(r.indicator));

  const countryRanks = ranks.filter((r) => r.countryId === id1);
  const vsCountryRanks = ranks.filter((r) => r.countryId === id2);
  const countryRanksBetter = countryRanks.filter((r) => {
    const vsRank = vsCountryRanks.find((v) => v.indicatorId === r.indicatorId);
    return vsRank && r.rank < vsRank.rank && r.value !== vsRank.value;
  });
  const vsCountryRanksBetter = vsCountryRanks.filter((r) => {
    const countryRank = countryRanks.find(
      (v) => v.indicatorId === r.indicatorId
    );
    return (
      countryRank && r.rank < countryRank.rank && r.value !== countryRank.value
    );
  });

  const list1 = countryRanksBetter
    .map((value1) => {
      const value2 = vsCountryRanks.find(
        (v) => v.indicatorId === value1.indicatorId
      )!;
      return {
        value1,
        value2,
        diff: value2.rank - value1.rank
      };
    })
    .sort((a, b) => b.diff - a.diff);

  const list2 = vsCountryRanksBetter
    .map((value1) => {
      const value2 = countryRanks.find(
        (c) => c.indicatorId === value1.indicatorId
      )!;
      return {
        value1,
        value2,
        diff: value2.rank - value1.rank
      };
    })
    .sort((a, b) => b.diff - a.diff);

  return { list1, list2 };
};
