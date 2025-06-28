import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
  build: {
    minify: "terser",
    manifest: true,
    outDir: "dist",
  },
  server: {
    cors: true,
  },
  plugins: [cssInjectedByJsPlugin()],
  base: "https://cdn.jsdelivr.net/gh/XYY-huijiwiki/monaco-editor-for-mediawiki@dist/",
});
