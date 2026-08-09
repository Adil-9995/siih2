import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: "/siih2.0/",
  },

  tanstackStart: {
    server: {
      entry: "server",
    },
  },
});
