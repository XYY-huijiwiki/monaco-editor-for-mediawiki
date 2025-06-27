import type { editor } from "monaco-editor";
import log from "./log";

async function linkToWikiEditor(editor: editor.IStandaloneCodeEditor) {
  // find editor
  let wikieditor: HTMLTextAreaElement | null = null;
  let findEditorCount = 0;
  while (wikieditor === null && findEditorCount < 5) {
    log.debug(`Finding wikieditor...`);
    wikieditor = document.getElementById(
      "wpTextbox1"
    ) as HTMLTextAreaElement | null;
    await new Promise((resolve) => setTimeout(resolve, 100));
    findEditorCount++;
  }
  if (!wikieditor) {
    log.error(`Wikieditor not found.`);
    return;
  }

  // link to monaco
  editor.getModel()?.onDidChangeContent(() => {
    const $textarea = $("#wpTextbox1");
    $textarea.textSelection("setContents", editor.getValue());
  });
}

export default linkToWikiEditor;
