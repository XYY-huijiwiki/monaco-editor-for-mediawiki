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

(() => {
  const log = (message: string) => console.log(`[ME4M] ${message}`);
  const errorLog = (message: string) => {
    console.error(`[ME4M ERROR] ${message}`);
    throw new Error(message);
  };

  log("Monaco Editor for MediaWiki is loaded, preparing...");

  // Ensure we're on a wiki edit page
  try {
    const currentLink = new URL(location.href);
    const action = currentLink.searchParams.get("action") || "";
    if (!["edit", "submit"].includes(action)) {
      log("Not in a wiki edit page");
      return;
    }
  } catch (err) {
    errorLog("Failed to parse URL.");
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
    log(`Content model: ${contentModel}`);
    const langMapper: Record<string, string> = {
      wikitext: "wikitext",
      GadgetDefinition: "json",
      HtmlMustache: "html",
      javascript: "javascript",
      css: "css",
      Scribunto: "lua",
    };
    const language = langMapper[contentModel || ""] || "plaintext";
    log(`Language: ${language}`);

    const originalTextarea = document.getElementById(
      "wpTextbox1"
    ) as HTMLTextAreaElement | null;

    if (!originalTextarea || !originalTextarea.parentNode) {
      log("No textarea found. Is this a wiki edit page?");
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

    // Initialize Monaco editor
    const editor = monacoInstance.editor.create(container, {
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
    genToolbar(editor);

    // replace original editors
    replaceWikieditor(editor);
    replaceCodemirror(editor);
    replaceAceeditor(editor);

    window.addEventListener("resize", () => editor.layout());
  };

  initEditor().catch((err) =>
    errorLog(`Initialization failed: ${err.message}`)
  );
})();
