import contentCollections from "@content-collections/solid-start";
import { defineConfig } from "@tanstack/start/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  vite: {
    plugins: [
      contentCollections(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
  },
});
