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

  const editorContainer = editorInstance.getContainerDomNode();

  // Host-Element für die Toolbar sicherstellen
  let toolbarHost = editorContainer.querySelector<HTMLDivElement>(
    `#monaco-toolbar-${__APP_ID__}`
  );
  if (!toolbarHost) {
    toolbarHost = document.createElement("div");
    toolbarHost.id = `#monaco-toolbar-${__APP_ID__}`;
    editorContainer.parentElement!.insertBefore(toolbarHost, editorContainer);
  }

  vueApp = createApp(App, { editorInstance });
  vueApp.mount(toolbarHost);
}

export default genToolbar;
