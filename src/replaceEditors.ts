import type { editor } from "monaco-editor";
import log from "./utils/log";

// returns `true` if the editor was replaced successfully
async function replaceWikieditor(editor: editor.IStandaloneCodeEditor) {
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
    return false;
  }

  // link monaco
  editor.getModel()?.onDidChangeContent(() => {
    wikieditor.value = editor.getValue();
  });

  return true;
}

// returns `true` if the editor was replaced successfully
async function replaceCodemirror(editor: editor.IStandaloneCodeEditor) {
  if (!(window as any).RLPAGEMODULES.includes("ext.CodeMirror")) {
    log.debug(
      `CodeMirror module not loaded in this page. Skipping replacement.`
    );
    return false;
  }

  // find editor
  let codemirror: HTMLElement | null = null;
  let findEditorCount = 0;
  while (codemirror === null && findEditorCount < 5) {
    log.debug(`Finding codemirror...`);
    codemirror = document.querySelector(".CodeMirror") as HTMLElement | null;
    await new Promise((resolve) => setTimeout(resolve, 100));
    findEditorCount++;
  }
  if (!codemirror) {
    log.error(`Codemirror not found.`);
    return false;
  }

  // link monaco
  editor.getModel()?.onDidChangeContent(() => {
    (codemirror as any).CodeMirror.setValue(editor.getValue());
  });

  return true;
}

// returns `true` if the editor was replaced successfully
async function replaceAceeditor(editor: editor.IStandaloneCodeEditor) {
  if (!(window as any).RLPAGEMODULES.includes("ext.codeEditor")) {
    log.debug(
      `Aceeditor module not loaded in this page. Skipping replacement.`
    );
    return false;
  }

  // find editor
  let aceeditor: HTMLElement | null = null;
  let findEditorCount = 0;
  while (aceeditor === null && findEditorCount < 5) {
    log.debug(`Finding aceeditor...`);
    aceeditor = document.querySelector(".ace_editor") as HTMLElement | null;
    await new Promise((resolve) => setTimeout(resolve, 100));
    findEditorCount++;
  }
  if (!aceeditor) {
    log.error(`Aceeditor not found.`);
    return false;
  }

  // link monaco
  editor.getModel()?.onDidChangeContent(() => {
    (window as any).ace.edit(aceeditor).setValue(editor.getValue());
  });

  return true;
}

export { replaceWikieditor, replaceCodemirror, replaceAceeditor };
