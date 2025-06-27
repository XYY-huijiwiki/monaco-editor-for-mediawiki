import ky from "ky";
import loader from "@monaco-editor/loader";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighter } from "shiki";
import getLangCode from "./utils/getLangCode";
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

async function initDiff({
  diffOldId,
  diffNewId,
}: {
  diffOldId: number;
  diffNewId: number;
}) {
  log.debug(`Initializing diff for ${diffOldId} → ${diffNewId}`);

  // Fetch both revisions in parallel
  const [oldSource, newSource] = await Promise.all([
    fetchRevisionSource(diffOldId),
    fetchRevisionSource(diffNewId),
  ]);

  // Map content model to Monaco language
  const contentModel = mw.config.get("wgPageContentModel");
  const langMapper: Record<string, string> = {
    wikitext: "wikitext",
    GadgetDefinition: "json",
    HtmlMustache: "html",
    javascript: "javascript",
    css: "css",
    Scribunto: "lua",
  };
  const language = langMapper[contentModel || ""] || "plaintext";

  // Prepare Monaco and Shiki
  const highlighter = await createHighlighter({
    themes: ["dark-plus", "light-plus"],
    langs: ["wikitext", "json", "html", "javascript", "css", "lua"],
  });

  loader.config({
    "vs/nls": {
      availableLanguages: {
        "*": getLangCode(mw.config.get("wgUserLanguage")),
      },
    },
  });
  const monacoInstance = await loader.init();

  monacoInstance.languages.register({ id: language });
  shikiToMonaco(highlighter, monacoInstance);

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
    // fallback: insert into #content or body
    const content = document.getElementById("content") || document.body;
    content.insertBefore(container, content.firstChild);
  }

  // Theme management
  const updateTheme = () => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    monacoInstance.editor.setTheme(isDark ? "dark-plus" : "light-plus");
  };
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", updateTheme);

  // Create Monaco diff editor
  const diffEditor = monacoInstance.editor.createDiffEditor(container, {
    theme: "dark-plus",
    readOnly: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    hideUnchangedRegions: {
      enabled: true,
    },
    wordWrap: ["wikitext", "plaintext"].includes(language) ? "on" : "off",
  });
  updateTheme();

  const originalModel = monacoInstance.editor.createModel(oldSource, language);
  const modifiedModel = monacoInstance.editor.createModel(newSource, language);

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel,
  });
}

export { initDiff };
