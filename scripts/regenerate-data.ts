import { fileURLToPath } from "url";
import * as pullRawData from "./pull-raw-data";
import * as commonData from "./common/generate";
import * as countryData from "./country/generate";
import * as indicatorData from "./indicator/generate";

async function regenerateAllData() {
  console.log("Regenerating all data...");
  await pullRawData.pullRawData();
  console.log("Raw data pulled successfully.");
  await commonData.start();
  console.log("Common data regenerated successfully.");
  await countryData.start();
  console.log("Country data regenerated successfully.");
  await indicatorData.start();
  console.log("Indicator data regenerated successfully.");
  await countryData.start();
  console.log("Country data regenerated successfully.");
  await indicatorData.start();
  console.log("Indicator data regenerated successfully.");
  console.log("All data regenerated successfully.");
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  regenerateAllData().catch((error) =>
    console.error("Error regenerating all data:", error)
  );
}
