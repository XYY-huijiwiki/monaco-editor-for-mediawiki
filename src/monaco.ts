import loader from "@monaco-editor/loader";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighter } from "shiki";
import { setTheme } from "@fluentui/web-components";
import { webLightTheme, webDarkTheme } from "@fluentui/tokens";

import getLangCode from "./utils/getLangCode";

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
["wikitext", "json", "html", "javascript", "css", "lua", "plaintext"].forEach(
  (lang) => {
    monacoInstance.languages.register({ id: lang });
  }
);
shikiToMonaco(highlighter, monacoInstance);

// Theme management
const updateTheme = () => {
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  monacoInstance.editor.setTheme(isDark ? "dark-plus" : "light-plus");
  // Set Fluent UI theme here for simplicity
  setTheme(isDark ? webDarkTheme : webLightTheme);
};
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", updateTheme);
monacoInstance.editor.onDidCreateEditor(() => updateTheme());
monacoInstance.editor.onDidCreateDiffEditor(() => updateTheme());

export default monacoInstance;
