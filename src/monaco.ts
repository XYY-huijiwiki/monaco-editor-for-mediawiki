import loader from "@monaco-editor/loader";
import * as monaco from "monaco-editor";
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
  monaco: monaco,
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

// additional wikitext support
monacoInstance.languages.setLanguageConfiguration("wikitext", {
  comments: {
    blockComment: ["<!--", "-->"],
  },
  brackets: [
    ["[", "]"],
    ["-{", "}-"],
    ["{|", "|}"],
    ["{{", "}}"],
    ["{{{", "}}}"],
  ],
  autoClosingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "-{", close: "}-" },
    { open: "<!--", close: "-->" },
    { open: "<b>", close: "</b>" },
    { open: "<blockquote>", close: "</blockquote>" },
    { open: "<ce>", close: "</ce>" },
    { open: "<chem>", close: "</chem>" },
    { open: "<code>", close: "</code>" },
    { open: "<div>", close: "</div>" },
    { open: "<graph>", close: "</graph>" },
    { open: "<hiero>", close: "</hiero>" },
    { open: "<i>", close: "</i>" },
    { open: "<includeonly>", close: "</includeonly>" },
    { open: "<math>", close: "</math>" },
    { open: "<noinclude>", close: "</noinclude>" },
    { open: "<nowiki>", close: "</nowiki>" },
    { open: "<onlyinclude>", close: "</onlyinclude>" },
    { open: "<pre>", close: "</pre>" },
    { open: "<ref>", close: "</ref>" },
    { open: "<s>", close: "</s>" },
    { open: "<score>", close: "</score>" },
    { open: "<span>", close: "</span>" },
    { open: "<syntaxhighlight>", close: "</syntaxhighlight>" },
    { open: "<templatedata>", close: "</templatedata>" },
  ],
  surroundingPairs: [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: "'", close: "'" },
  ],
});

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
