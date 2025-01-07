import { defineConfig } from "@solidjs/start/config";
import contentCollections from "@content-collections/vinxi";

export default defineConfig({
  vite: {
    plugins: [contentCollections()],
  },
});
