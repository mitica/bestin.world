import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs/promises";
import {
  getCountries,
  getIndicators,
  readCountryInsights,
  readIndicatorRanks
} from "../common/helpers";
import { localesProvider } from "../../src/locales";
import layoutElements from "./helpers/layout-elements";
import getEmojiElement from "./helpers/get-emoji-element";
import {
  countryCodeToFlagEmoji,
  getCountriesByContinent,
  getCountryContinent,
  getVsCountryCodes,
  truncateText
} from "../../src/utils";
import { compareCountryIndicators } from "../../src/helpers/country-vs-country-indicators";
import { TOP_COUNTRIES } from "../../src/config";
import { fileURLToPath } from "url";
import { compressedBuffer } from "./helpers/compress-image";

// Load custom font
const fontData = await Promise.all([
  fs.readFile("src/fonts/Inter-Bold.ttf"),
  fs.readFile("src/fonts/Inter-Medium.ttf")
]);

const [countries] = await Promise.all([getCountries()]);

const locales = localesProvider.lang("en");

export async function generateImage(id1: string, id2: string) {
  const [country, vsCountry] = countries.filter(
    (c) => c.id === id1 || c.id === id2
  );

  const { list1, list2 } = await compareCountryIndicators({
    id1,
    id2,
    indicators: await getIndicators(),
    indicatorRanks: await readIndicatorRanks()
  });

  if (list1.length === 0 && list2.length === 0) {
    console.warn(`No indicators found for ${id1} vs ${id2}`);
    return;
  }

  const list = list1.slice(0, 3).map((item) => ({
    name: truncateText(
      item.value1.indicator.commonName || item.value1.indicator.name,
      70
    ),
    emoji: item.value1.indicator.emoji || ""
  }));

  if (list1.length > 3)
    list.push({
      name: "+" + (list1.length - 3),
      emoji: ""
    });

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#ffffff",
          color: "#000000",
          fontFamily: "Inter",
          fontSize: "24px",
          boxSizing: "border-box",
          padding: "2rem",
          overflow: "hidden",
          gap: "3rem"
        },
        children: [
          ...(await layoutElements()),
          {
            type: "h1",
            props: {
              style: {
                margin: 0,
                padding: 0,
                // fontSize: "2rem",
                // fontWeight: "bold",
                // lineHeight: "1.2",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "1rem",
                width: "100%"
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "1rem",
                      flex: 1
                      // width: "400px"
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {},
                          children: country.name
                        }
                      },
                      await getEmojiElement(countryCodeToFlagEmoji(id1), 48)
                    ]
                  }
                },
                {
                  type: "span",
                  props: {
                    style: {
                      fontSize: "2rem",
                      fontWeight: "normal",
                      color: "#888888",
                      flex: "none"
                    },
                    children: locales.vs()
                  }
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "1rem",
                      flex: 1
                    },
                    children: [
                      await getEmojiElement(countryCodeToFlagEmoji(id2), 48),
                      {
                        type: "span",
                        props: {
                          children: vsCountry.name
                        }
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            type: "h1",
            props: {
              style: {
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "2rem",
                fontSize: "4rem"
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      color: "#158f39"
                    },
                    children: list1.length
                  }
                },
                {
                  type: "span",
                  props: {
                    style: {
                      color: "#888888"
                    },
                    children: "/"
                  }
                },
                {
                  type: "span",
                  props: {
                    style: {
                      color: "#158f39"
                    },
                    children: list2.length
                  }
                }
              ]
            }
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.8rem"
              },
              children: await Promise.all(
                list.map(async (item) => ({
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      textAlign: "center",
                      color: "#888888",
                      fontSize: "1.8rem",
                      gap: "1rem"
                    },
                    children: [
                      await getEmojiElement(item.emoji, 32),
                      {
                        type: "span",
                        props: {
                          style: {
                            fontWeight: "bold",
                            textShadow: "2px 2px 1px rgba(250, 250, 250, 0.6)"
                          },
                          children: item.name
                        }
                      }
                    ]
                  }
                }))
              )
            }
          }
        ]
      }
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: fontData[0],
          weight: 700,
          style: "normal"
        },
        {
          name: "Inter",
          data: fontData[1],
          weight: 500,
          style: "normal"
        }
      ]
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1200
    }
  });

  const img = resvg.render();
  const pngBuffer = await compressedBuffer(img.asPng());
  await fs.writeFile(`public/${country.id}-vs-${vsCountry.id}.png`, pngBuffer);
}

export async function generateImages() {
  for (const country of countries) {
    const codes = getVsCountryCodes(countries, country);
    for (const code of codes) {
      if (code !== country.id) {
        await generateImage(country.id, code);
        console.log(`Generated image for ${country.id} vs ${code}`);
      }
    }
  }
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generateImages();
}
