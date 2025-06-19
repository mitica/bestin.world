import removeAccents from "remove-accents";
import { twMerge, type ClassNameValue } from "tailwind-merge";

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
