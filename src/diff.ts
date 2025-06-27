import ky from "ky";
import type * as monaco from "monaco-editor";

import log from "./utils/log";

async function fetchRevisionSource(revid: number): Promise<string> {
  // Fetch revision content from MediaWiki API
  const api = mw.config.get("wgScriptPath") + "/api.php";
  const params = {
    action: "query",
    prop: "revisions",
    rvprop: "content",
    revids: revid,
    format: "json",
    formatversion: "2",
    origin: "*",
  };
  const url = api + "?" + new URLSearchParams(params as any).toString();
  const resp = await ky.get(url).json<any>();
  const page = resp.query?.pages?.[0];
  return page?.revisions?.[0]?.content ?? "";
}

async function initDiffEditor({
  diffOldId,
  diffNewId,
  monacoInstance,
  contentModel,
}: {
  diffOldId: number;
  diffNewId: number;
  monacoInstance: typeof monaco;
  contentModel: ContentModel;
}) {
  log.debug(`Initializing diff for ${diffOldId} → ${diffNewId}`);

  // Fetch both revisions in parallel
  const [oldSource, newSource] = await Promise.all([
    fetchRevisionSource(diffOldId),
    fetchRevisionSource(diffNewId),
  ]);

  // Create diff container
  const container = document.createElement("div");
  Object.assign(container.style, {
    height: "70vh",
    width: "100%",
    backgroundColor: "var(--container)",
  });

  // Remove all siblings of tr.diff-title and add container as a new sibling
  const diffTitleRow = document.querySelector("tr.diff-title");
  if (diffTitleRow && diffTitleRow.parentElement) {
    let sibling = diffTitleRow.nextSibling;
    while (sibling) {
      const next = sibling.nextSibling;
      diffTitleRow.parentElement.removeChild(sibling);
      sibling = next;
    }
    const wrapperRow = document.createElement("tr");
    const wrapperCell = document.createElement("td");
    wrapperCell.colSpan = 4;
    wrapperCell.appendChild(container);
    wrapperRow.appendChild(wrapperCell);
    diffTitleRow.parentElement.appendChild(wrapperRow);
  } else {
    log.error("`tr.diff-title` not found. Cannot insert diff container.");
  }

  // Create Monaco diff editor
  const diffEditor = monacoInstance.editor.createDiffEditor(container, {
    readOnly: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    hideUnchangedRegions: {
      enabled: true,
    },
    wordWrap: ["wikitext", "plaintext"].includes(contentModel) ? "on" : "off",
  });

  const originalModel = monacoInstance.editor.createModel(
    oldSource,
    contentModel
  );
  const modifiedModel = monacoInstance.editor.createModel(
    newSource,
    contentModel
  );

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel,
  });

  return diffEditor;
}

export default initDiffEditor;
