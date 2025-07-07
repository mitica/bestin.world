import type {
  CountryInfo,
  InsightInfo
} from "../../../src/content/common/types";
import CountryTopItem from "./country-top-item";

export default async function CountryTopList({
  list,
  style = {},
  itemStyle = {}
}: {
  list: {
    insights: InsightInfo[];
    country: CountryInfo;
  }[];
  style?: any;
  itemStyle?: any;
}) {
  // flex flex-col text-lg gap-1 items-start
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        alignItems: "center",
        ...style
      },
      children: await Promise.all(
        list.map(
          async (item) => await CountryTopItem({ ...item, style: itemStyle })
        )
      )
    }
  };
}
