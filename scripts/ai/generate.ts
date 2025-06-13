import * as countryInsights from "./gen-country-insights";

async function generate() {
  console.log("Generating country insights...");
  await countryInsights.generate();
  console.log("Country insights generation completed.");
}
generate()
  .then(() => console.log("All tasks completed successfully."))
  .catch((error) => console.error("Error during generation:", error));
