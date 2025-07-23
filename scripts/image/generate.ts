import * as genOgHome from "./gen-og-home";
import * as geoOgCountry from "./gen-og-country";
import * as genOgCountryVsCountry from "./gen-og-country-vs-country";
import { fileURLToPath } from "url";

export async function generate() {
  try {
    console.log("Generating OG image for home page...");
    await genOgHome.generateImage();
    console.log("OG image for home page generated successfully.");
    await geoOgCountry.generateImages();
    console.log("OG images for countries generated successfully.");
    await genOgCountryVsCountry.generateImages();
    console.log("OG images for country vs country generated successfully.");
  } catch (error) {
    console.error("Error generating OG images:", error);
  }
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  generate();
}
