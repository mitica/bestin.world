import removeAccents from "remove-accents";
import { twMerge, type ClassNameValue } from "tailwind-merge";
import { countries, continents } from "countries-list";
import type { ContinentInfo } from "./content/common/types";

/**
 * Get a list of country codes by continent.
 * @param continent The continent code to filter by.
 * @returns An array of country codes belonging to the specified continent.
 */
export const getCountriesByContinent = (continent: string): string[] => {
  continent = continent.toUpperCase();
  const continentCountries: string[] = [];
  for (const countryCode in countries) {
    const country = countries[countryCode as keyof typeof countries];
    if (country.continent === continent) {
      continentCountries.push(countryCode.toLowerCase());
    }
  }
  return continentCountries;
};

export const getCountryContinent = (countryCode: string): string | null => {
  countryCode = countryCode.toUpperCase();
  const country = countries[countryCode as keyof typeof countries];
  if (country) {
    return country.continent;
  }
  return null; // Return null if country not found
};

export const getContinentInfo = (continent: string): ContinentInfo => {
  continent = continent.toUpperCase();
  const name = continents[continent as keyof typeof continents];
  if (name) {
    return {
      id: continent.toLowerCase(),
      name,
      cca2: continent.toLowerCase(),
      code: continent.toLowerCase()
    };
  }
  throw new Error(`Continent ${continent} not found`);
};

export const createFolderIfNotExists = async (path: string) => {
  const fs = await import("fs/promises");
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (error) {
    console.error(`Error creating folder ${path}:`, error);
  }
  return path;
};

export const fileExists = async (path: string) => {
  const fs = await import("fs/promises");
  try {
    await fs.access(path);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false; // File does not exist
    }
    console.error(`Error checking file ${path}:`, error);
    throw error; // Re-throw other errors
  }
};

export const removeDiacritics = (str: string): string => removeAccents(str);

export const slugify = (text: string): string => {
  return removeDiacritics(text.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

export const toTopicId = (name: string): string => {
  return slugify(name.trim().split("&")[0].trim());
};

export function classNames(...inputs: ClassNameValue[]) {
  return twMerge(inputs);
}

export function countryCodeToFlagEmoji(code: string): string {
  code = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/i.test(code)) {
    throw new Error("Invalid country code. Must be 2 letters.");
  }

  return code
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}

export const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && !isNaN(value);
};

export const uniq = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};
