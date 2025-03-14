import type { editor } from "monaco-editor";

async function replaceWikieditor(editor: editor.IStandaloneCodeEditor) {
  // find editor
  let wikieditor: HTMLTextAreaElement | null = null;
  let findEditorCount = 0;
  while (wikieditor === null && findEditorCount < 5) {
    console.log(`[ME4M] Finding wikieditor...`);
    wikieditor = document.getElementById(
      "wpTextbox1"
    ) as HTMLTextAreaElement | null;
    await new Promise((resolve) => setTimeout(resolve, 100));
    findEditorCount++;
  }
  if (!wikieditor) {
    throw new Error(`[ME4M] Failed to find wikieditor.`);
  }

  // link monaco
  editor.getModel()?.onDidChangeContent(() => {
    wikieditor.value = editor.getValue();
  });
}

async function replaceCodemirror(editor: editor.IStandaloneCodeEditor) {
  if (!(window as any).RLPAGEMODULES.includes("ext.CodeMirror")) {
    return;
  }

  // find editor
  let codemirror: HTMLElement | null = null;
  let findEditorCount = 0;
  while (codemirror === null && findEditorCount < 5) {
    console.log(`[ME4M] Finding codemirror...`);
    codemirror = document.querySelector(".CodeMirror") as HTMLElement | null;
    await new Promise((resolve) => setTimeout(resolve, 100));
    findEditorCount++;
  }
  if (!codemirror) {
    throw new Error(`[ME4M] Failed to find codemirror.`);
  }

  // link monaco
  editor.getModel()?.onDidChangeContent(() => {
    (codemirror as any).CodeMirror.setValue(editor.getValue());
  });
}

async function replaceAceeditor(editor: editor.IStandaloneCodeEditor) {
  if (!(window as any).RLPAGEMODULES.includes("ext.codeEditor")) {
    return;
  }

  // find editor
  let aceeditor: HTMLElement | null = null;
  let findEditorCount = 0;
  while (aceeditor === null && findEditorCount < 5) {
    console.log(`[ME4M] Finding aceeditor...`);
    aceeditor = document.querySelector(".ace_editor") as HTMLElement | null;
    await new Promise((resolve) => setTimeout(resolve, 100));
    findEditorCount++;
  }
  if (!aceeditor) {
    throw new Error(`[ME4M] Failed to find aceeditor.`);
  }

  // link monaco
  editor.getModel()?.onDidChangeContent(() => {
    (window as any).ace.edit(aceeditor).setValue(editor.getValue());
  });
}

export { replaceWikieditor, replaceCodemirror, replaceAceeditor };
