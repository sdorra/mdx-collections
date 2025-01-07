import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  vite: {
    plugins() {
      console.log("that is not the right type");
    },
  },
});
