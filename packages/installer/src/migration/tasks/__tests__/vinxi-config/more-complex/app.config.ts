import { defineConfig } from "@solidjs/start/config"
import samplePlugin from "sample-plugin"

export default defineConfig({
  ssr: true,
  server: {
    preset: "vercel"
  },
  vite: {
    plugins: [samplePlugin()]
  }
})
