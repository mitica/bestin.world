import type {
  CountryInfo,
  InsightInfo
} from "../../../src/content/common/types";
import CountryTopList from "./country-top-list";
import getEmojiElement from "./get-emoji-element";

export default async function CountryTopLists({
  best,
  worst
}: {
  best: {
    insights: InsightInfo[];
    country: CountryInfo;
  }[];
  worst: {
    insights: InsightInfo[];
    country: CountryInfo;
  }[];
}) {
  // flex flex-col text-lg gap-1 items-start
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "row",
        gap: "3rem",
        width: "100%",
        padding: "2rem"
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "1.4rem",
              // fontSize: "1.125rem", // 18px
              alignItems: "flex-end",
              width: "48%"
            },
            children: [
              {
                type: "h3",
                props: {
                  style: {
                    color: "#4CAF50", // green
                    display: "flex",
                    gap: "1rem",
                    margin: 0,
                    padding: 0,
                    fontSize: "2rem",
                  },
                  children: [
                    {
                      type: "span",
                      props: {
                        children: "Unicorns",
                        style: {
                          textShadow: "2px 2px 1px rgba(255, 255, 255, 0.5)"
                        }
                      }
                    },
                    await getEmojiElement("🦄", 32)
                  ]
                }
              },
              await CountryTopList({
                list: best,
                itemStyle: { flexDirection: "row-reverse" },
                // items-end
                style: {
                  alignItems: "flex-end"
                }
              })
            ]
          }
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "1.4rem",
              // fontSize: "1.125rem",
              alignItems: "flex-start",
              width: "50%"
            },
            children: [
              {
                type: "h3",
                props: {
                  style: {
                    color: "#F44336", // red
                    display: "flex",
                    flexDirection: "row-reverse",
                    gap: "1rem",
                    margin: 0,
                    padding: 0,
                    fontSize: "2rem",
                  },
                  children: [
                    {
                      type: "span",
                      props: {
                        children: "Stragglers",
                        style: {
                          textShadow: "2px 2px 1px rgba(255, 255, 255, 0.5)"
                        }
                      }
                    },
                    await getEmojiElement("🐌", 32)
                  ]
                }
              },
              await CountryTopList({
                list: worst,
                // items-end
                style: {
                  alignItems: "flex-start"
                }
              })
            ]
          }
        }
      ]
    }
  };
}
