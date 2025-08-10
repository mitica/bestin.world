import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import fs from "fs/promises";

import { bestWorstCountries } from "../../src/helpers/best-worst-countries";
import { getCountries, readCountryInsights } from "../common/helpers";
import CountryTopLists from "./helpers/country-top-lists";
import { localesProvider } from "../../src/locales";
import layoutElements from "./helpers/layout-elements";
import { fileURLToPath } from "url";
import { compressedBuffer } from "./helpers/compress-image";

export async function generateImage() {
  // Load custom font
  const fontData = await Promise.all([
    fs.readFile("src/fonts/Inter-Bold.ttf"),
    fs.readFile("src/fonts/Inter-Medium.ttf")
  ]);
  const [insights, countries] = await Promise.all([
    readCountryInsights(),
    getCountries()
  ]);
  console.log(
    `Loaded ${insights.length} insights and ${countries.length} countries`
  );
  const { Best, Worst } = bestWorstCountries({
    insights,
    countries,
    limit: 10
  });
  const locales = localesProvider.lang("en");

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
          overflow: "hidden"
        },
        children: [
          ...(await layoutElements()),
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
              children: locales.countries_at_the_extremes()
            }
          },
          await CountryTopLists({
            best: Best,
            worst: Worst
          })
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
  await fs.writeFile(`public/index.png`, pngBuffer);
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generateImage();
}
