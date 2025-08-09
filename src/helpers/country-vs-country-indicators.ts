import { MAIN_INDICATOR_IDS } from "../config";
import type {
  IndicatorCountryRankValue,
  IndicatorInfo
} from "../content/common/types";

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
  indicators: IndicatorInfo[];
  indicatorRanks: IndicatorCountryRankValue[];
};

export const compareCountryIndicators = ({
  id1,
  id2,
  indicators,
  indicatorRanks
}: Props) => {
  const getIndicator = (id: string) => {
    return indicators.find((indicator) => indicator.id === id)!;
  };

  const year = new Date().getFullYear();

  const ranks = indicatorRanks
    .filter((it) => it.countryId === id1 || it.countryId === id2)
    .map((r) => ({
      ...r,
      indicator: getIndicator(r.indicatorId)
    }))
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
