import loader from "@monaco-editor/loader";
import { setTheme } from "@fluentui/web-components";
import { webLightTheme, webDarkTheme } from "@fluentui/tokens";
import genToolbar from "./toolbar";
import {
  replaceAceeditor,
  replaceCodemirror,
  replaceWikieditor,
} from "./replaceEditors";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighter } from "shiki";
import getLangCode from "./utils/getLangCode";
import { initDiff } from "./diff";
import log from "./utils/log";
import type * as monaco from "monaco-editor";

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

async function main() {
  log.debug("Monaco Editor for MediaWiki is loaded, preparing...");

  // Ensure we're on a wiki edit page or diff page
  try {
    const currentLink = new URL(location.href);
    const action = currentLink.searchParams.get("action") || "";
    const diffNewId = mw.config.get("wgDiffNewId");
    const diffOldId = mw.config.get("wgDiffOldId");
    if (diffNewId && diffOldId) {
      log.debug("In a wiki diff page");
      initDiff({ diffOldId, diffNewId });
      return;
    }
    if (!["edit", "submit"].includes(action)) {
      log.debug("Not in a wiki edit page");
      return;
    }
  } catch (err) {
    log.error("Failed to parse URL.");
    return;
  }

  // Wait for document to be fully loaded
  const waitForDOMReady = () =>
    new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", () => resolve(), { once: true });
      }
    });

  // Initialize editor
  const initEditor = async () => {
    await waitForDOMReady();

    // Map wiki content model to VSCode language
    const contentModel = mw.config.get("wgPageContentModel");
    log.debug(`Content model: ${contentModel}`);
    const langMapper: Record<string, string> = {
      wikitext: "wikitext",
      GadgetDefinition: "json",
      HtmlMustache: "html",
      javascript: "javascript",
      css: "css",
      Scribunto: "lua",
    };
    const language = langMapper[contentModel || ""] || "plaintext";
    log.debug(`Language: ${language}`);

    const originalTextarea = document.getElementById(
      "wpTextbox1"
    ) as HTMLTextAreaElement | null;

    if (!originalTextarea || !originalTextarea.parentNode) {
      log.error("No textarea found. Is this a wiki edit page?");
      return;
    }

    // raw wikiEditor dark mode
    import("./styles.css");

    // Create Shiki highlighter
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

    // Create editor container
    const container = document.createElement("div");
    Object.assign(container.style, { height: "70vh", width: "100%" });
    originalTextarea.parentNode.insertBefore(container, originalTextarea);
    originalTextarea.style.display = "none";

    // Theme management
    const updateTheme = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      monacoInstance.editor.setTheme(isDark ? "dark-plus" : "light-plus");
      setTheme(isDark ? webDarkTheme : webLightTheme);
    };
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", updateTheme);

    // Before creating a new editor, dispose the old one if it exists
    if (editorInstance) {
      editorInstance.dispose();
      editorInstance = null;
    }

    // Initialize Monaco editor
    editorInstance = monacoInstance.editor.create(container, {
      value: originalTextarea.value,
      language,
      theme: "dark-plus",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: ["wikitext", "plaintext"].includes(language) ? "on" : "off",
      minimap: {
        enabled: ["wikitext", "plaintext"].includes(language) ? true : false,
      },
    });
    updateTheme();
    genToolbar(editorInstance);

    // replace original editors
    replaceWikieditor(editorInstance);
    replaceCodemirror(editorInstance);
    replaceAceeditor(editorInstance);
  };

  initEditor().catch((err) =>
    log.error(`Initialization failed: ${err.message}`)
  );
}

// Initial run
main().catch((err) => log.error(`Initialization failed: ${err.message}`));

// Listen for soft navigation (example: MediaWiki's page ready event)
mw.hook("wikipage.content").add(() => {
  main().catch((err) => log.error(`Re-initialization failed: ${err.message}`));
});
