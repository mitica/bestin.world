import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs/promises";
import { getCountries, readCountryInsights } from "../common/helpers";
import { localesProvider } from "../../src/locales";
import layoutElements from "./helpers/layout-elements";
import getEmojiElement from "./helpers/get-emoji-element";
import { countryCodeToFlagEmoji } from "../../src/utils";

// Load custom font
const fontData = await Promise.all([
  fs.readFile("src/fonts/Inter-Bold.ttf"),
  fs.readFile("src/fonts/Inter-Medium.ttf")
]);

const [countries] = await Promise.all([getCountries()]);

const locales = localesProvider.lang("en");

export async function generateImage(countryId: string) {
  const country = countries.find((c) => c.id === countryId);
  if (!country) {
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
          gap: "2.4rem"
        },
        children: [
          ...(await layoutElements()),
          await getEmojiElement(countryCodeToFlagEmoji(countryId), {
            width: 60,
            height: 60,
            position: "absolute",
            top: "2rem",
            right: "2.5rem"
          }),
          {
            type: "h2",
            props: {
              style: {
                margin: 0,
                padding: 0,
                // fontSize: "2rem",
                fontWeight: "bold",
                lineHeight: "1.2"
              },
              children: locales.country_page_title(country.name)
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
                      color: item.type === "GOOD" ? "#158f39" : "#ef4444",
                      fontSize: "1.8rem",
                      gap: "1rem"
                    },
                    children: [
                      await getEmojiElement(item.emoji, 32),
                      {
                        type: "span",
                        props: {
                          style: {
                            fontWeight: "bold"
                          },
                          children: item.title
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
  const pngBuffer = img.asPng();
  await fs.writeFile(`public/${country.slug}.png`, pngBuffer);
}

export async function generateImages() {
  for (const country of countries) {
    await generateImage(country.id);
  }
}
