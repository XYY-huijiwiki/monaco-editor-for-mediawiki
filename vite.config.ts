import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import Icons from "unplugin-icons/vite";

export default defineConfig({
  build: {
    minify: "terser",
    manifest: true,
    outDir: "dist",
  },
  server: {
    cors: true,
  },
  plugins: [cssInjectedByJsPlugin(), Icons()],
});
