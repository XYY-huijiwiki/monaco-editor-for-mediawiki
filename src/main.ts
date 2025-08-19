import type * as monaco from "monaco-editor";

import { monacoInstance } from "@karsten_zhou/utils";
import languageMapper from "./utils/languageMapper";
import initDiffEditor from "./diff";
import log from "./utils/log";
import initEditor from "./edit";

let diffEditorInstance: monaco.editor.IStandaloneDiffEditor | null = null;
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null;

let isMainRunning = false;
let isMainQueued = false;

async function main() {
  // Prevent multiple concurrent runs of main()
  if (isMainRunning) {
    if (!isMainQueued) {
      isMainQueued = true;
      log.debug("main() is running, queueing one more run.");
    } else {
      log.debug("main() is running and already queued, skipping.");
    }
    return;
  }
  isMainRunning = true;

  log.debug("Monaco Editor for MediaWiki is loaded, preparing...");

  // clear previous instances
  if (diffEditorInstance) {
    diffEditorInstance.dispose();
    diffEditorInstance = null;
  }
  if (editorInstance) {
    editorInstance.dispose();
    editorInstance = null;
  }

  // Ensure we're on a wiki edit page or diff page
  try {
    const currentLink = new URL(location.href);
    const action = currentLink.searchParams.get("action") || "";
    const diffNewId = mw.config.get("wgDiffNewId");
    const diffOldId = mw.config.get("wgDiffOldId");
    const contentModel = languageMapper(mw.config.get("wgPageContentModel"));
    if (diffNewId && diffOldId) {
      log.debug("In a wiki diff page");
      diffEditorInstance = await initDiffEditor({
        diffOldId,
        diffNewId,
        monacoInstance,
        contentModel,
      });
      return;
    }
    if (["edit", "submit"].includes(action)) {
      log.debug("In a wiki edit page");
      editorInstance = await initEditor({
        monacoInstance,
        contentModel,
      });
      return;
    }
  } catch (err) {
    log.error(err);
  } finally {
    isMainRunning = false;
    if (isMainQueued) {
      isMainQueued = false;
      log.debug("Running queued main() invocation.");
      // Run the queued invocation
      main();
    }
  }
}

// Utility to run a function when DOM is ready
function onDOMReady(fn: () => void) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}

// Initial run
onDOMReady(() => {
  main().catch((err) => log.error(`Initialization failed: ${err.message}`));
});

// Listen for soft navigation (example: MediaWiki's page ready event)
mw.hook("wikipage.content").add(() => {
  main().catch((err) => log.error(`Re-initialization failed: ${err.message}`));
});
