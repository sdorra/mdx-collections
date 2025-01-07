import contentCollections from "@content-collections/vinxi";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  vite: {
    plugins: [contentCollections()],
  },
});
