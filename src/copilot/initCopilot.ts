import DarkCopilotIcon from "~icons/vscode-icons/file-type-copilot?raw";
import LightCopilotIcon from "~icons/vscode-icons/file-type-light-copilot?raw";
import "@fluentui/web-components/button.js";
import { createPatch } from "diff";
import ky from "ky";
import type { Button } from "@fluentui/web-components";
import log from "../utils/log";
import { getPage } from "../mwApi";
import { debounce } from "lodash-es";

async function generateSummary(
  title: string,
  oldContent: string,
  newContent: string
): Promise<string> {
  // Create a diff between the old and new content
  const diff = createPatch(
    title,
    oldContent,
    newContent,
    undefined,
    undefined,
    { context: Infinity, stripTrailingCr: true, ignoreWhitespace: true }
  );

  const result = await ky
    .post("//wiki-summary.24218079.xyz", {
      body: diff,
    })
    .text();
  return result;
}

async function initCopilot(getNewContent: () => string) {
  // clear previous instances if any
  const oldCopilotBtn = document.querySelector(`#copilot-btn-4e54299e5a58`);
  if (oldCopilotBtn) {
    oldCopilotBtn.parentNode?.removeChild(oldCopilotBtn);
  }

  const copilotBtn = document.createElement("fluent-button") as Button;
  copilotBtn.iconOnly = true;
  copilotBtn.ariaLabel = "Copilot";
  copilotBtn.size = "small";
  copilotBtn.appearance = "transparent";
  copilotBtn.onclick = debounce(async () => {
    // existing content check
    let wpSummary = document.getElementById(
      "wpSummary"
    ) as HTMLInputElement | null;
    if (!wpSummary)
      throw new Error("wpSummary not found. Is this a wiki edit page?");
    if (wpSummary.value) {
      if (
        !confirm(
          "You have already written a summary. Do you want to overwrite it?"
        )
      )
        return;
    }

    // loading state begin
    copilotBtn.disabled = true;
    copilotBtn.style.setProperty("cursor", "wait");

    try {
      const title = `${mw.config.get("wgPageName")}.wiki` || "Untitled.wiki";
      const oldContent = (await getPage(mw.config.get("wgPageName")))?.content;
      if (!oldContent) throw new Error("Failed to fetch old content.");
      const newContent = getNewContent();
      const summary = await generateSummary(title, oldContent, newContent);
      wpSummary.value = summary;
    } catch (error) {
      log.error(error);
      alert(error);
    }

    // loading state end
    copilotBtn.disabled = false;
    copilotBtn.style.removeProperty("cursor");
  });
  const wrapperDiv = document.createElement("div");
  wrapperDiv.style.setProperty("position", "absolute");
  wrapperDiv.style.setProperty("top", "0");
  wrapperDiv.style.setProperty("right", "0.25rem");
  wrapperDiv.style.setProperty("bottom", "0");
  wrapperDiv.style.setProperty("display", "flex");
  wrapperDiv.style.setProperty("align-items", "center");
  wrapperDiv.style.setProperty("justify-content", "center");
  wrapperDiv.id = `copilot-btn-4e54299e5a58`;
  wrapperDiv.appendChild(copilotBtn);

  // TODO: Unremoved old event listeners
  // theme management
  function updateIcon() {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    copilotBtn.innerHTML = isDark ? DarkCopilotIcon : LightCopilotIcon;
  }
  // Initial setzen
  updateIcon();
  // Bei Änderung des Farbschemas aktualisieren
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", updateIcon);

  const wpSummaryWidget = document.getElementById("wpSummaryWidget");
  if (!wpSummaryWidget) {
    throw new Error("wpSummaryWidget not found. Is this a wiki edit page?");
  }
  wpSummaryWidget.appendChild(wrapperDiv);
}

export default initCopilot;
