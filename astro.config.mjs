// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://josebulalaque.github.io",
  devToolbar: {
    enabled: false,
  },
  server: {
    port: 4321,
  },
  vite: {
    // @ts-ignore
    plugins: [tailwindcss()],
  },
});
