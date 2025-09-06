import genToolbar from "./toolbar";
import linkToWikiEditor from "./utils/linkToWikiEditor";
import log from "./utils/log";
import type * as monaco from "monaco-editor";

async function initEditor({
  monacoInstance,
  contentModel,
}: {
  monacoInstance: typeof monaco;
  contentModel: ContentModel;
}) {
  const originalTextarea = document.getElementById(
    "wpTextbox1"
  ) as HTMLTextAreaElement | null;

  if (!originalTextarea || !originalTextarea.parentNode) {
    log.error("No textarea found. Is this a wiki edit page?");
    return null;
  }

  // remove old container if exists
  const oldContainer = document.querySelector(".monaco-editor-container");
  if (oldContainer) {
    oldContainer.parentNode?.removeChild(oldContainer);
  }
  // Create editor container
  const container = document.createElement("div");
  container.className = "monaco-editor-container";
  Object.assign(container.style, { height: "70vh", width: "100%" });
  originalTextarea.parentNode.insertBefore(container, originalTextarea);
  originalTextarea.style.display = "none";

  // Initialize Monaco editor
  const editorInstance = monacoInstance.editor.create(container, {
    value: originalTextarea.value,
    language: contentModel,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: ["wikitext", "plaintext"].includes(contentModel) ? "on" : "off",
    minimap: {
      enabled: ["wikitext", "plaintext"].includes(contentModel) ? true : false,
    },
  });

  await genToolbar(editorInstance);
  await linkToWikiEditor(editorInstance);

  return editorInstance;
}

export default initEditor;
