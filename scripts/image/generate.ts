import * as genOgHome from "./gen-og-home";
import * as geoOgCountry from "./gen-og-country";
import * as genOgCountryVsCountry from "./gen-og-country-vs-country";
import { fileURLToPath } from "url";

export async function generate() {
  const promises: Promise<void>[] = [];

  console.log("Generating OG image for home page...");
  promises.push(
    genOgHome
      .generateImage()
      .then(() => console.log("OG image for home page generated successfully."))
  );
  promises.push(
    geoOgCountry
      .generateImages()
      .then(() =>
        console.log("OG images for countries generated successfully.")
      )
  );
  promises.push(
    genOgCountryVsCountry
      .generateImages()
      .then(() =>
        console.log("OG images for country vs country generated successfully.")
      )
  );
  try {
    await Promise.all(promises);
  } catch (error) {
    console.error("Error generating OG images:", error);
  }
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generate();
}
