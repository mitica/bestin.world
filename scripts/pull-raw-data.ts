import { readFile, writeFile } from "fs/promises";
import { delay } from "../src/utils";
import { getCountries } from "./common/helpers";

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

type HDRData = {
  country: string;
  countryIsoCode: string;
  indexCode: string;
  index: string;
  indicatorCode: string;
  indicator: string;
  value: string;
  note: string;
  year: string;
};

const hdrIndicatorsMap = {
  mpi_rank: "mpi",
  assets: "mpi-assets",
  child_mortality: "mpi-child-mortality",
  drinking_water: "mpi-drinking-water",
  electricity: "mpi-electricity",
  housing: "mpi-housing",
  nutrition: "mpi-nutrition",
  sanitation: "mpi-sanitation",
  school_attendance: "mpi-school-attendance",
  years_of_schooling: "mpi-years-of-schooling",
  cooking_fuel: "mpi-cooking-fuel"
} as any;

async function hdrData() {
  const result: HDRData[] = [];
  const countries = await getCountries();
  const countryIds = countries.map((country) => country.id);
  for (let year = new Date().getFullYear(); year >= 2012; year--) {
    const response = await fetch(
      `https://hdrdata.org/api/CompositeIndices/query-detailed?apikey=${process.env.HDR_API_KEY}&year=${year}`
    );
    if (!response.ok) {
      if (response.statusText === "Not Found") {
        console.warn(`No HDR data found for year ${year}`);
        await delay(1000);
        continue;
      }
      throw new Error(
        `Failed to fetch HDR indicators data: ${response.statusText}`
      );
    }
    const data: HDRData[] = await response.json();
    if (data.length === 0) {
      console.warn(`No HDR data found for year ${year}`);
      await delay(1000);
      continue;
    }
    await delay(3000);
    const validIndicatorCodes = [
      "gii",
      "gdi",
      "hdi",
      "ihdi",
      "phdi",
      ...Object.keys(hdrIndicatorsMap)
    ];
    const list = data.filter(
      (item) =>
        validIndicatorCodes.includes(item.indicatorCode) &&
        item.value !== "0" &&
        countries.find(
          (country) =>
            country.cca3?.toUpperCase() === item.countryIsoCode.toUpperCase()
        )
    );
    if (result.length === 0) {
      const indicators = validIndicatorCodes.map((code) => {
        const item = list.find((i) => i.indicatorCode === code);
        const it = { ...item } as any;
        delete it.note;
        delete it.countryIsoCode;
        delete it.value;
        delete it.country;
        delete it.year;
        it.name = it.index;
        if (hdrIndicatorsMap[code]?.startsWith("mpi-")) {
          it.name = [it.name, it.indicator].join(", ");
        }
        return it;
      });
      await writeFile(
        "data/hdr-indicators.json",
        JSON.stringify(
          indicators.map((item) => ({
            ...item,
            indicatorCode:
              hdrIndicatorsMap[item.indicatorCode] || item.indicatorCode
          })),
          null,
          2
        ),
        "utf-8"
      );
    }
    result.push(
      ...list.map((item) => ({
        ...item,
        indicatorCode:
          hdrIndicatorsMap[item.indicatorCode] || item.indicatorCode
      }))
    );
  }
  await writeFile(
    "data/hdr-data.json",
    JSON.stringify(result, null, 2),
    "utf-8"
  );
}

async function pull() {
  // await pullCountries();
  // await pullLanguages();
  // await wbIndicators();
  // await pullWorldBankValues();
  await hdrData();
}

pull()
  .then(() => console.log("Countries data pulled successfully"))
  .catch((error) => console.error("Error pulling countries data:", error));
