import { fileURLToPath } from "url";
import * as indicatorRank from "./indicator-rank";

export async function start() {
  await indicatorRank.generate();
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  start();
}
