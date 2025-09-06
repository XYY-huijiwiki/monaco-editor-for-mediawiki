import { createI18n } from "vue-i18n";
import type { DefaultLocaleMessageSchema } from "vue-i18n";
import { match } from "@formatjs/intl-localematcher";

const locales = import.meta.glob("./*.json", { import: "default" });

const supportedLocales = Object.keys(locales).map((key) => {
  return key.slice(2, -5); // Remove './' and '.json'
});
let matchResult = match(navigator.languages, supportedLocales, "en-US");

const messages: Record<string, DefaultLocaleMessageSchema> = {};
messages[matchResult] = (await locales[
  `./${matchResult}.json`
]()) as DefaultLocaleMessageSchema;

const i18n = createI18n({
  legacy: false,
  locale: matchResult,
  messages,
});

const t = i18n.global.t;

export default i18n;
export { t, matchResult as currentLocale };
