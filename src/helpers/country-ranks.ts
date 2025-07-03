import { getCollection } from "astro:content";
import { MAIN_INDICATOR_IDS } from "../config";
import { uniq } from "../utils";

type IndicatorRanksProps = {
  countryId?: string;
  topicId?: string;
};

export const getIndicatorRanks = async ({
  countryId,
  topicId
}: IndicatorRanksProps = {}) => {
  const [indicatorRanks, indicators] = await Promise.all([
    getCollection("indicatorRanks"),
    getCollection("indicators")
  ]);

  const getIndicator = (id: string) => {
    return indicators.find((indicator) => indicator.id === id)!.data;
  };

  const year = new Date().getFullYear();

  let ranks = indicatorRanks
    .map((rank) =>
      rank.data.map((r) => ({
        ...r,
        indicatorId: rank.id,
        indicator: getIndicator(rank.id)
      }))
    )
    .flat()
    .filter(
      (r) => r.date > year - 20 && MAIN_INDICATOR_IDS.includes(r.indicatorId)
    );

  ranks = countryId ? ranks.filter((r) => r.countryId === countryId) : ranks;
  ranks = topicId
    ? ranks.filter((r) => r.indicator.topicIds.includes(topicId))
    : ranks;

  return ranks;
};

type RanksProps = IndicatorRanksProps;

export const getRanks = async (props: RanksProps) => {
  const indicatorRanks = await getIndicatorRanks(props);
  const ranks: {
    countryId: string;
    values: typeof indicatorRanks;
    score: number;
    rank: number;
  }[] = [];
  const countryIds = uniq(indicatorRanks.map((r) => r.countryId));
  for (const countryId of countryIds) {
    const values = indicatorRanks.filter((r) => r.countryId === countryId);
    const score = values.reduce((acc, r) => acc + r.rank, 0);
    ranks.push({ countryId, values, score, rank: 0 });
  }
  ranks.sort((a, b) => a.score - b.score);
  ranks.forEach((r, index) => {
    r.rank = index + 1;
  });
  return ranks;
};
