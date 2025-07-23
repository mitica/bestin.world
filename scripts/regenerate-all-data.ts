import { fileURLToPath } from "url";
import * as pullRawData from "./pull-raw-data";
import * as commonData from "./common/generate";
import * as countryData from "./country/generate";
import * as indicatorData from "./indicator/generate";

async function regenerateAllData() {
  await pullRawData.pullRawData();
  await commonData.start();
  await countryData.start();
  await indicatorData.start();
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  regenerateAllData()
    .then(() => console.log("All data regenerated successfully"))
    .catch((error) => console.error("Error regenerating all data:", error));
}
