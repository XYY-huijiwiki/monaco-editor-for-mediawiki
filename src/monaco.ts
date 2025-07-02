import loader from "@monaco-editor/loader";
import { setTheme } from "@fluentui/web-components";
import { webLightTheme, webDarkTheme } from "@fluentui/tokens";
import registerWiki, {
  registerJavaScript,
  registerCSS,
  registerLua,
} from "monaco-wiki";
import darkPlus from "shiki/themes/dark-plus.mjs";
import lightPlus from "shiki/themes/light-plus.mjs";
import { match } from "@formatjs/intl-localematcher";

const displayLocale = match(
  [mw.config.get("wgUserLanguage")],
  ["en", "de", "es", "fr", "it", "ja", "ko", "ru", "zh-cn", "zh-tw"],
  "en"
);

loader.config({
  "vs/nls": {
    availableLanguages: {
      "*": displayLocale,
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
  [displayLocale],

  // (optional) custom download URL for the `wikiparse` object`
  "https://testingcf.jsdelivr.net/npm/wikiparser-node",

  // (optional) Shiki themes
  [darkPlus, lightPlus]
);

registerJavaScript(
  monacoInstance,

  // (optional) custom download URL for the `eslint` object`
  "https://testingcf.jsdelivr.net/npm/@bhsd/eslint-browserify"
);

registerCSS(
  monacoInstance,

  // (optional) custom download URL for the `stylelint` object`
  "https://testingcf.jsdelivr.net/npm/@bhsd/stylelint-browserify"
);

registerLua(
  monacoInstance,

  // (optional) custom download URL for the `luacheck` object`
  "https://testingcf.jsdelivr.net/npm/luacheck-browserify"
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

const Range = monacoInstance.Range;
const KeyCode = monacoInstance.KeyCode;
const KeyMod = monacoInstance.KeyMod;

export default monacoInstance;
export { Range, KeyCode, KeyMod };
