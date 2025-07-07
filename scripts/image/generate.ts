import * as genOgHome from "./gen-og-home";
import * as geoOgCountry from "./gen-og-country";

async function main() {
  try {
    await genOgHome.generateImage();
    await geoOgCountry.generateImages();
    console.log("OG image for home page generated successfully.");
  } catch (error) {
    console.error("Error generating OG image for home page:", error);
  }
}

await main();
