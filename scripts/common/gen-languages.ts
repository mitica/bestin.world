import type { LanguageInfo } from "../../src/content/common/types";
import languages from "../../data/languages.json";
import { saveFileIfChanged } from "./helpers";
import { fileURLToPath } from "url";

export async function gen() {
  const result: LanguageInfo[] = [];

  for (const item of languages) {
    const code = item["1"].toLowerCase();
    const id = code;
    const code3 = item["2"].toLowerCase();
    result.push({
      id,
      code,
      name: item.name,
      native: item.local,
      cca3: code3
    });
  }

  const content = JSON.stringify(result, null, 2);
  await saveFileIfChanged("src/content/common/languages.json", content);
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  gen();
}
