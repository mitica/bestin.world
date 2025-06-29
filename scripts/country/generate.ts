import * as countryTop from "./country-top";

async function start() {
  await countryTop.generate();
}

start()
  .then(() => console.log("Data generated successfully"))
  .catch((error) => console.error("Error generating data:", error));
