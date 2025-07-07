import type {
  CountryInfo,
  InsightInfo
} from "../../../src/content/common/types";
import { countryCodeToFlagEmoji, uniq } from "../../../src/utils";
import getEmojiElement from "./get-emoji-element";

export default async function CountryTopItem({
  insights,
  country,
  style = {}
}: {
  insights: InsightInfo[];
  country: CountryInfo;
  style?: any;
}) {
  const emojies = insights.map((insight) => insight.emoji);
  const uniqueEmojis = uniq(emojies).slice(0, 5);
  const elist = await Promise.all(
    uniqueEmojis.map((emoji) => getEmojiElement(emoji, 24))
  ).then((items) => items.filter(Boolean));

  return {
    type: "div",
    props: {
      style: {
        fontWeight: insights.length < 3 ? "bold" : "normal",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        ...style
      },
      children: [
        await getEmojiElement(countryCodeToFlagEmoji(country.code), 24),
        {
          type: "span",
          props: {
            children: country.name,
            style: {
              textShadow: "2px 2px 1px rgba(255, 255, 255, 0.5)"
            }
          }
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              alignItems: "center"
            },
            children: elist
          }
        }
      ]
    }
  };
}
