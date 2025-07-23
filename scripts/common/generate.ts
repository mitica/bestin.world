import { fileURLToPath } from "url";
import * as genCountries from "./gen-countries";
import * as genLanguages from "./gen-languages";
import * as genIndicators from "./gen-indicators";
import * as genTopics from "./gen-topics";

export async function start() {
  await genLanguages.gen();
  await genCountries.gen();
  await genIndicators.gen();
  await genTopics.gen();
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  start();
}
