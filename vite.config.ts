import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import Icons from "unplugin-icons/vite";
import fs from "node:fs";
import path from "node:path";
import vue from "@vitejs/plugin-vue";
import { visualizer } from "rollup-plugin-visualizer";

const appId = "8c1872"; // Definiere die App-ID hier

export default defineConfig(({ mode }) => {
  return {
    build: {
      minify: "terser",
      manifest: true,
      rollupOptions: {
        plugins: [visualizer({ filename: "./dist/stats.html" })],
      },
    },
    server: {
      cors: true,
    },
    plugins: [cssInjectedByJsPlugin(), vue(), Icons(), postBuildPlugin(appId)],
    define: {
      __APP_ID__: JSON.stringify(appId),
      __COPILOT_URL__: JSON.stringify(
        mode === "development"
          ? "http://localhost:8787"
          : "https://wiki-summary.24218079.xyz"
      ),
    },
  };
});

// Beispiel für ein einfaches Postbuild-Plugin
function postBuildPlugin(_appId: string) {
  return {
    name: "post-build-plugin",
    closeBundle() {
      // Manifest-Typ definieren
      type Manifest = {
        [key: string]: {
          file: string;
          // ...weitere Felder, falls benötigt...
        };
      };

      // Manifest laden
      const manifestPath = path.join(
        __dirname,
        "dist",
        ".vite",
        "manifest.json"
      );
      const manifest: Manifest = JSON.parse(
        fs.readFileSync(manifestPath, "utf-8")
      );

      // JS-Datei aus Manifest holen
      const jsFileRel: string = manifest["index.html"].file;

      // JS-Datei kopieren
      const srcPath = path.join(__dirname, "dist", jsFileRel);
      const destPath = path.join(__dirname, "dist", "index.js");
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} to ${destPath}`);
    },
  };
}
