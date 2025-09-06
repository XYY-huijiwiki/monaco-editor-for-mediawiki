import type { editor } from "monaco-editor";
import { createApp } from "vue";
import App from "./App.vue";

let vueApp: ReturnType<typeof createApp> | null = null;

async function genToolbar(editorInstance: editor.IStandaloneCodeEditor) {
  // append the toolbar to the editor
  if (vueApp) {
    vueApp.unmount();
    vueApp = null;
  }
  vueApp = createApp(App, { editorInstance });
  const controlsEle = document.querySelector(
    "div.wikiEditor-ui-controls"
  ) as HTMLDivElement | null;
  if (!controlsEle) throw new Error("Could not find `.wikiEditor-ui-controls`");
  controlsEle.style.backgroundColor = "transparent";
  vueApp.mount(controlsEle);
}

export default genToolbar;
