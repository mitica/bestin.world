import { writeFile } from "fs/promises";

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

async function pull() {
  await pullCountries();
  await pullLanguages();
}

pull()
  .then(() => console.log("Countries data pulled successfully"))
  .catch((error) => console.error("Error pulling countries data:", error));
