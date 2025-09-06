import { defineConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import Icons from "unplugin-icons/vite";
import fs from "node:fs";
import path from "node:path";
import vue from "@vitejs/plugin-vue";

const appId = "8c1872"; // Definiere die App-ID hier

export default defineConfig(({ mode }) => {
  return {
    build: {
      minify: "terser",
      manifest: true,
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
      const manifestPath = path.join(__dirname, "./dist/.vite/manifest.json");
      const manifest: Manifest = JSON.parse(
        fs.readFileSync(manifestPath, "utf-8")
      );

      // JS-Datei aus Manifest holen
      const jsFileRel: string = manifest["index.html"].file;
      const jsFilePath = path.join(__dirname, "./dist/", jsFileRel);
      const jsContent = fs.readFileSync(jsFilePath, "utf-8");

      // TXT-Inhalt zusammenbauen
      const txtContent = `<!--

    请勿在此处修改代码！请勿在此处修改代码！请勿在此处修改代码！

    - 源代码储存在GitHub上：https://github.com/XYY-huijiwiki/monaco-editor-for-mediawiki
    - 请在GitHub上修改代码
    - GitHub上的代码会自动同步到此处

-->
eval(${JSON.stringify(jsContent)});
`;

      // TXT-Datei schreiben
      fs.writeFileSync(
        path.join(__dirname, "./dist/output.txt"),
        txtContent,
        "utf-8"
      );
      console.log("output.txt wurde erstellt.");
    },
  };
}
