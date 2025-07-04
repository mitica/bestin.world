// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://bestin.world",

  redirects: {
    "/us": "/united-states",
    "/usa": "/united-states",
    "/uk": "/united-kingdom",
    "/gb": "/united-kingdom",
    "/ca": "/canada",
    "/vatican-city": "/vatican"
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
