/// <reference types="vite/client" />

type ContentModel =
  | "wikitext"
  | "json"
  | "html"
  | "javascript"
  | "css"
  | "lua"
  | "plaintext";

declare const __APP_ID__: string;
declare const __COPILOT_URL__: string;
