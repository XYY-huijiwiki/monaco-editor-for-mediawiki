import loader from "@monaco-editor/loader";
import { setTheme } from "@fluentui/web-components";
import { webLightTheme, webDarkTheme } from "@fluentui/tokens";
import registerWiki from "./monaco-wiki/main";

import getLangCode from "./utils/getLangCode";

loader.config({
  "vs/nls": {
    availableLanguages: {
      "*": getLangCode(mw.config.get("wgUserLanguage")),
    },
  },
});

const monacoInstance = await loader.init();

await registerWiki(
  monacoInstance,

  // Set to `true` if used in a MediaWiki site,
  // or a string to specify a preset configuration (https://github.com/bhsd-harry/wikiparser-node/tree/main/config)
  true,

  // (optional) i18n language codes with a preferred order,
  // e.g. `['zh-hans', 'zh-hant', 'en']`
  [getLangCode(mw.config.get("wgUserLanguage"))]
);

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
