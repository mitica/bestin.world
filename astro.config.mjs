// @ts-nocheck
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
    plugins: [tailwindcss()],
    // Optimize development performance
    server: {
      // Add timeout to prevent hanging
      hmr: {
        port: 4322,
        overlay: true
      },
      watch: {
        // Completely ignore the public folder from file watching
        ignored: [
          "**/public/**",
          "**/*.png",
          "**/*.jpg",
          "**/*.jpeg",
          "**/*.gif",
          "**/*.svg",
          "**/node_modules/**",
          "**/.git/**"
        ],
        // Use polling for better performance on Windows
        usePolling: false,
        interval: 100
      },
      fs: {
        // Allow serving files from the entire project
        allow: [".."]
      }
    },
    // Add CSS processing configuration
    css: {
      devSourcemap: true
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
      // Force include common dependencies
      include: [],
      // Exclude problematic dependencies
      exclude: ["astro"]
    },
    // Faster builds in development
    build: {
      // Use faster source maps in development
      sourcemap: process.env.NODE_ENV === "development" ? "inline" : false,
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 1000,
      // Don't minify in development
      minify: process.env.NODE_ENV === "production"
    }
  }
});
