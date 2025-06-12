import { readFile, writeFile } from "fs/promises";

async function pullCountries() {
  const response = await fetch(
    "https://raw.githubusercontent.com/mledoze/countries/master/countries.json"
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch countries data: ${response.statusText}`);
  }
  const data = await response.json();
  await writeFile(
    "data/countries.json",
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

async function pullLanguages() {
  const response = await fetch(
    "https://raw.githubusercontent.com/adlawson/nodejs-langs/master/data.js"
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch languages data: ${response.statusText}`);
  }
  const data = JSON.parse(
    (await response.text()).replace("module.exports = ", "").replace("];", "]")
  );
  await writeFile(
    "data/languages.json",
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

async function wbIndicators() {
  const response = await fetch(
    "https://api.worldbank.org/v2/source/2/indicators?format=json&per_page=20000"
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch languages data: ${response.statusText}`);
  }
  const data = await response.json();
  await writeFile(
    "data/wb-indicators.json",
    JSON.stringify(data[1], null, 2),
    "utf-8"
  );
}

async function pullWorldBankValues() {
  const indicators = await readFile(
    "src/content/common/indicators.json",
    "utf-8"
  ).then((data) => JSON.parse(data));
  const year = new Date().getFullYear();
  for (const indicator of indicators) {
    const response = await fetch(
      `https://api.worldbank.org/v2/country/all/indicator/${indicator.idWorldBank}?date=2000:${year}&format=json&per_page=20000`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch indicator data: ${response.statusText}`);
    }
    const data = await response.json();
    await writeFile(
      `data/wb/wb-indicator-${indicator.idWorldBank}.json`,
      JSON.stringify(data[1], null, 2),
      "utf-8"
    );
    await new Promise((resolve) => setTimeout(resolve, 1000)); // To avoid hitting API rate limits
  }
}

async function pull() {
  await pullCountries();
  await pullLanguages();
  await wbIndicators();
  await pullWorldBankValues();
}

pull()
  .then(() => console.log("Countries data pulled successfully"))
  .catch((error) => console.error("Error pulling countries data:", error));
