import * as countryTop from "./country-top";
import { fileURLToPath } from "url";

export async function start() {
  await countryTop.generate();
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  start();
}
