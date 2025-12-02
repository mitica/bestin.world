import { readFile } from "fs/promises";
import { delay } from "../src/utils";
import { getCountries, saveFileIfChanged } from "./common/helpers";
import { fileURLToPath } from "url";

async function pullCountries() {
  const response = await fetch(
    "https://raw.githubusercontent.com/mledoze/countries/master/countries.json"
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch countries data: ${response.statusText}`);
  }
  const data = await response.json();
  data.forEach((country: any) => {
    if (country.name.common === "Türkiye") {
      country.name.common = "Turkey";
    } else if (country.name.common === "Somalia, Fed. Rep.") {
      country.name.common = "Somalia";
    }
  });
  await saveFileIfChanged("data/countries.json", JSON.stringify(data, null, 2));
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
  await saveFileIfChanged("data/languages.json", JSON.stringify(data, null, 2));
}

async function wbIndicators() {
  const response = await fetch(
    "https://api.worldbank.org/v2/source/2/indicators?format=json&per_page=20000"
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch languages data: ${response.statusText}`);
  }
  const data = await response.json();
  await saveFileIfChanged(
    "data/wb-indicators.json",
    JSON.stringify(data[1], null, 2)
  );
}

let ERROR_COUNT = 0;
const fetchWorldBankIndicator = async (indicatorId: string, iterator = 0) => {
  const year = new Date().getFullYear();
  const response = await fetch(
    `https://api.worldbank.org/v2/country/all/indicator/${indicatorId}?date=2000:${year}&format=json&per_page=20000`
  );
  if (!response.ok) {
    console.error(await response.text());
    if (iterator < 3) {
      console.warn(`Retrying fetch for ${indicatorId}...`);
      await delay(2000);
      return fetchWorldBankIndicator(indicatorId, iterator + 1);
    }
    ERROR_COUNT++;
    if (ERROR_COUNT > 5) {
      throw new Error(`Failed to fetch indicator data: ${response.statusText}`);
    }
    return [];
  }
  const data = await response.json();

  const items: { value: number | null }[] = data[1] || [];

  items.forEach((item) => {
    if (item.value === null || item.value === undefined) return;
    // round to 6 decimal places
    item.value = Number(item.value.toFixed(6));
  });

  return items;
};

async function pullWorldBankValues() {
  const indicators = await readFile(
    "src/content/common/indicators.json",
    "utf-8"
  ).then((data) => JSON.parse(data));
  const startIndicator: string = process.env.START_INDICATOR || "";
  let started = startIndicator === "";
  for (const indicator of indicators) {
    if (indicator.idWorldBank === startIndicator) started = true;
    if (!started) continue;
    if (!indicator.idWorldBank) continue;

    const data = await fetchWorldBankIndicator(indicator.idWorldBank);
    if (data.length === 0) {
      console.warn(`No data found for indicator ${indicator.idWorldBank}`);
      continue;
    }
    await saveFileIfChanged(
      `data/wb/wb-indicator-${indicator.idWorldBank}.json`,
      JSON.stringify(data, null, 2)
    );
    await delay(1000);
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
  cooking_fuel: "mpi-cooking-fuel",
  gii_rank: "gii",
  gdi_rank: "gdi",
  hdi_rank: "hdi",
  ihdi_rank: "ihdi",
  phdi_rank: "phdi"
} as any;

async function hdrData() {
  const result: HDRData[] = [];
  const countries = await getCountries();
  // const countryIds = countries.map((country) => country.id);
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
    // console.log(`Fetched HDR data for year ${year}, records: ${data.length}`);
    // console.log(`Example record:`, data[0]);
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
    // console.log(`Filtered HDR data for year ${year}, records: ${list.length}`);
    if (result.length === 0) {
      const indicators = validIndicatorCodes
        .map((code) => {
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
        })
        .filter((it) => !!it.name);
      // console.log(`HDR Indicators metadata:`, indicators);
      await saveFileIfChanged(
        "data/hdr-indicators.json",
        JSON.stringify(
          indicators.map((item) => ({
            ...item,
            indicatorCode:
              hdrIndicatorsMap[item.indicatorCode] || item.indicatorCode
          })),
          null,
          2
        )
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
  // console.log(`Total HDR records fetched: ${result.length}`);
  // console.log(`Example HDR record:`, result[0]);
  await saveFileIfChanged(
    "data/hdr-data.json",
    JSON.stringify(
      result,
      // .filter((it) =>
      //   countryIds.includes(it.countryIsoCode.trim().toLowerCase())
      // ),
      null,
      2
    )
  );
}

export async function pullRawData() {
  await pullCountries();
  await pullLanguages();
  await wbIndicators();
  await pullWorldBankValues();
  await hdrData();
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  pullRawData();
}
