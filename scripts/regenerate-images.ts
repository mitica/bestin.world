import { fileURLToPath } from "url";
import * as images from "./image/generate";

async function regenerate() {
  await images.generate();
}

const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  regenerate();
}
