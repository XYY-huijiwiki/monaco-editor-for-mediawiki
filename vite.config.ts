import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    minify: "terser",
    manifest: true,
    // rollupOptions: {
    //   external: ["monaco-editor"],
    // },
  },
  server: {
    cors: true,
  },
  plugins: [cssInjectedByJsPlugin()],
  base: "https://xyy-huijiwiki.github.io/monaco-editor-for-mediawiki/",
});
