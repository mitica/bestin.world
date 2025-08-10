import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs/promises";
import {
  getCountries,
  getCountrySummary,
  readCountryInsights
} from "../common/helpers";
import { localesProvider } from "../../src/locales";
import layoutElements from "./helpers/layout-elements";
import getEmojiElement from "./helpers/get-emoji-element";
import { countryCodeToFlagEmoji } from "../../src/utils";
import { compressedBuffer } from "./helpers/compress-image";
import { fileURLToPath } from "url";
import { MAIN_INDICATOR_IDS } from "../../src/config";

// Load custom font
const fontData = await Promise.all([
  fs.readFile("src/fonts/Inter-Bold.ttf"),
  fs.readFile("src/fonts/Inter-Medium.ttf")
]);

const [countries, countrySummaries] = await Promise.all([
  getCountries(),
  getCountrySummary()
]);

const locales = localesProvider.lang("en");

export async function generateImage(countryId: string) {
  const country = countries.find((c) => c.id === countryId);
  const countrySummary = countrySummaries.find(
    (cs) => cs.countryId === countryId
  );
  const topNumber = countrySummaries.length;

  if (!country || !countrySummary) {
    throw new Error(`Country with ID ${countryId} not found`);
  }

  const tops = await readCountryInsights(countryId);
  const bestIn = tops
    .filter((it) => it.type === "GOOD")
    .sort((a, b) => b.year - a.year);
  const worstIn = tops
    .filter((it) => it.type === "BAD")
    .sort((a, b) => b.year - a.year);
  const limit = 8;
  const list = bestIn.slice(0, limit - 2);
  list.push(...worstIn.slice(0, limit - list.length));
  const name = country.name;

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
          backgroundColor: "#fafbfc",
          color: "#000000",
          fontFamily: "Inter",
          fontSize: "24px",
          boxSizing: "border-box",
          padding: "2rem",
          overflow: "hidden",
          gap: "2.4rem"
        },
        children: [
          ...(await layoutElements()),
          await getEmojiElement(countryCodeToFlagEmoji(countryId), {
            width: 100,
            height: 100,
            position: "absolute",
            top: "2rem",
            right: "2.5rem"
          }),
          {
            type: "h1",
            props: {
              children: name
            }
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem"
              },
              children: [
                {
                  type: "h2",
                  props: {
                    style: {
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      gap: "2rem",
                      fontSize: "8rem",
                      color: "#333333"
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            color: "#10b981"
                          },
                          children: countrySummary.rank
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
                          children: topNumber
                        }
                      }
                    ]
                  }
                },
                {
                  type: "p",
                  props: {
                    style: {
                      color: "#666666",
                      fontSize: "1.5rem",
                      textAlign: "center"
                    },
                    children: locales.country_summary_rank_info({
                      country: name,
                      rank: countrySummary.rank,
                      total: topNumber,
                      indicatorCount: MAIN_INDICATOR_IDS.length
                    })
                  }
                }
              ]
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
  await fs.writeFile(`public/${country.slug}.png`, pngBuffer);
}

export async function generateImages() {
  for (const country of countries) {
    await generateImage(country.id);
    console.log(`Generated image for ${country.name}`);
  }
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generateImages();
}
