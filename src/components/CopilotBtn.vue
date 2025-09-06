<script setup lang="ts">
import { ref, Teleport } from "vue";
import { getPage } from "../mwApi";
import { createPatch } from "diff";
import ky from "ky";
import log from "../utils/log";
import DarkCopilotIcon from "~icons/vscode-icons/file-type-copilot?raw";
import LightCopilotIcon from "~icons/vscode-icons/file-type-light-copilot?raw";
import { CdxButton, CdxIcon, CdxTooltip } from "@wikimedia/codex";
import { usePreferredColorScheme } from "@vueuse/core";

const preferredColor = usePreferredColorScheme();

// tooltip register
const vTooltip = CdxTooltip;

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
    { ignoreWhitespace: true, context: Infinity }
  );

  const result = await ky
    .post(__COPILOT_URL__, {
      body: diff,
    })
    .text();
  return result;
}

const props = defineProps<{
  getNewContent: () => string;
}>();

const loading = ref(false);

async function handleClick() {
  const wpSummary = document.getElementById(
    "wpSummary"
  ) as HTMLInputElement | null;
  if (!wpSummary) {
    alert("wpSummary not found. Is this a wiki edit page?");
    return;
  }
  if (wpSummary.value) {
    if (
      !confirm(
        "You have already written a summary. Do you want to overwrite it?"
      )
    )
      return;
  }
  loading.value = true;
  try {
    const title = `${mw.config.get("wgPageName")}.wiki` || "Untitled.wiki";
    const oldContent = (await getPage(mw.config.get("wgPageName")))?.content;
    if (!oldContent) throw new Error("Failed to fetch old content.");
    const newContent = props.getNewContent();
    const summary = await generateSummary(title, oldContent, newContent);
    wpSummary.value = summary;
  } catch (error) {
    log.error(error);
    alert(error);
  }
  loading.value = false;
}
</script>

<template>
  <Teleport to="#wpSummaryWidget">
    <div
      id="copilot-btn-4e54299e5a58"
      style="
        position: absolute;
        top: 0;
        right: 0.25rem;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <cdx-button
        v-tooltip:top="'Copilot'"
        aria-label="Copilot"
        weight="quiet"
        type="button"
        :disabled="loading"
        :style="{ cursor: loading ? 'wait' : 'pointer' }"
        @click="handleClick"
        size="small"
      >
        <cdx-icon
          :icon="preferredColor === 'dark' ? DarkCopilotIcon : LightCopilotIcon"
        />
      </cdx-button>
    </div>
  </Teleport>
</template>
