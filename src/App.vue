<script setup lang="ts">
import { CdxButton, CdxIcon, CdxTooltip } from "@wikimedia/codex";
import {
  cdxIconBold,
  cdxIconImageGallery,
  cdxIconImageLayoutThumbnail,
  cdxIconItalic,
  cdxIconReference,
  cdxIconSubscript,
  cdxIconSuperscript,
  cdxIconTable,
  cdxIconUnderline,
  // cdxIconUpload,
} from "@wikimedia/codex-icons";
import type { editor } from "monaco-editor";
import { Range, KeyCode, KeyMod } from "@karsten_zhou/utils";
import CopilotBtn from "./components/CopilotBtn.vue";
// import FileUploader from "./components/FileUploader.vue";
// import { ref } from "vue";

// tooltip register
const vTooltip = CdxTooltip;

// recive editor instance
const { editorInstance } = defineProps<{
  editorInstance: editor.IStandaloneCodeEditor;
}>();

// define buttons
const buttons = [
  {
    key: "bold",
    icon: cdxIconBold,
    label: mw.message("wikieditor-toolbar-tool-bold").text(),
    action: () =>
      charInsert(
        "'''+'''",
        mw.message("wikieditor-toolbar-tool-bold-example").text()
      ),
    kbd: KeyMod.CtrlCmd | KeyCode.KeyB,
  },
  {
    key: "italic",
    icon: cdxIconItalic,
    label: mw.message("wikieditor-toolbar-tool-italic").text(),
    action: () =>
      charInsert(
        "''+''",
        mw.message("wikieditor-toolbar-tool-italic-example").text()
      ),
    kbd: KeyMod.CtrlCmd | KeyCode.KeyI,
  },
  {
    key: "underline",
    icon: cdxIconUnderline,
    label: mw.message("wikieditor-toolbar-tool-underline").text(),
    action: () =>
      charInsert(
        "''+''",
        mw.message("wikieditor-toolbar-tool-underline-example").text()
      ),
    kbd: KeyMod.CtrlCmd | KeyCode.KeyU,
  },
  {
    key: "superscript",
    icon: cdxIconSuperscript,
    label: mw.message("wikieditor-toolbar-tool-superscript").text(),
    action: () =>
      charInsert(
        "<sup>+</sup>",
        mw.message("wikieditor-toolbar-tool-superscript-example").text()
      ),
  },
  {
    key: "subscript",
    icon: cdxIconSubscript,
    label: mw.message("wikieditor-toolbar-tool-subscript").text(),
    action: () =>
      charInsert(
        "<sub>+</sub>",
        mw.message("wikieditor-toolbar-tool-subscript-example").text()
      ),
  },
  {
    key: "reference",
    icon: cdxIconReference,
    label: mw.message("wikieditor-toolbar-tool-reference").text(),
    action: () =>
      charInsert(
        "<ref>+</ref>",
        mw.message("wikieditor-toolbar-tool-reference-example").text()
      ),
  },
  {
    key: "thumbnail",
    icon: cdxIconImageLayoutThumbnail,
    label: mw.message("wikieditor-toolbar-tool-file").text(),
    action: () =>
      charInsert(
        "[[文件:+|缩略图]]",
        mw.message("wikieditor-toolbar-tool-file-example").text()
      ),
  },
  {
    key: "gallery",
    icon: cdxIconImageGallery,
    label: mw.message("wikieditor-toolbar-tool-gallery").text(),
    action: () =>
      charInsert(
        "<gallery>\n+\n</gallery>",
        mw.message("wikieditor-toolbar-tool-gallery-example").text(),
        true
      ),
  },
  {
    key: "table",
    icon: cdxIconTable,
    label: mw.message("wikieditor-toolbar-tool-table").text(),
    action: () =>
      charInsert(
        `{| class="wikitable"
|+ ${mw.message("wikieditor-toolbar-tool-table-example-caption").text()}
! ${mw.message("wikieditor-toolbar-tool-table-example-header").text()}
! ${mw.message("wikieditor-toolbar-tool-table-example-header").text()}
! ${mw.message("wikieditor-toolbar-tool-table-example-header").text()}
|-
| ${mw.message("wikieditor-toolbar-tool-table-example-cell-text").text()}
| ${mw.message("wikieditor-toolbar-tool-table-example-cell-text").text()}
| ${mw.message("wikieditor-toolbar-tool-table-example-cell-text").text()}
|-
| ${mw.message("wikieditor-toolbar-tool-table-example-cell-text").text()}
| ${mw.message("wikieditor-toolbar-tool-table-example-cell-text").text()}
| ${mw.message("wikieditor-toolbar-tool-table-example-cell-text").text()}
|-
| ${mw.message("wikieditor-toolbar-tool-table-example-cell-text").text()}
| ${mw.message("wikieditor-toolbar-tool-table-example-cell-text").text()}
| ${mw.message("wikieditor-toolbar-tool-table-example-cell-text").text()}
|}`,
        "",
        true
      ),
  },
];

// define lang for icons
const lang = new Intl.Locale(mw.config.get("wgUserLanguage")).language;

// help function to insert characters
function charInsert(
  pattern: string,
  placeholderText: string = "",
  isBlock: boolean = false
): void {
  const splitIndex = pattern.indexOf("+");
  const [left, right] =
    splitIndex === -1
      ? [pattern, ""]
      : [pattern.substring(0, splitIndex), pattern.substring(splitIndex + 1)];

  const model = editorInstance.getModel();
  const selection = editorInstance.getSelection();

  if (!model || !selection) return;

  if (selection.isEmpty()) {
    const position = editorInstance.getPosition();
    if (!position) return;

    if (isBlock) {
      // Block mode handling with line breaks
      const currentLine = model.getLineContent(position.lineNumber);
      const beforeCursor = currentLine.substring(0, position.column - 1);
      const afterCursor = currentLine.substring(position.column - 1);

      const needsPreNewline = beforeCursor.length > 0;
      const needsPostNewline = afterCursor.length > 0;

      const insertText = placeholderText
        ? (needsPreNewline ? "\n" : "") +
          left +
          placeholderText +
          right +
          (needsPostNewline ? "\n" : "")
        : pattern;
      // Execute insertion
      editorInstance.executeEdits("charInsert", [
        {
          range: new Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          text: insertText,
          forceMoveMarkers: true,
        },
      ]);

      // Calculate selection range
      const startLine = position.lineNumber + (needsPreNewline ? 1 : 0);
      const startColumn = left.length + 1;
      const endColumn = startColumn + placeholderText.length;

      editorInstance.setSelection(
        new Range(startLine, startColumn, startLine, endColumn)
      );
    } else {
      // Original inline handling
      const insertText = left + placeholderText + right;
      editorInstance.executeEdits("charInsert", [
        {
          range: new Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
          ),
          text: insertText,
          forceMoveMarkers: true,
        },
      ]);

      const startColumn = position.column + left.length;
      const endColumn = startColumn + placeholderText.length;
      editorInstance.setSelection(
        new Range(
          position.lineNumber,
          startColumn,
          position.lineNumber,
          endColumn
        )
      );
    }
    editorInstance.focus();
  } else {
    // Handle selection wrapping
    const selectedText = model.getValueInRange(selection);
    let wrappedText = left + selectedText + right;

    if (isBlock) {
      // Check if selection is surrounded by newlines
      const start = selection.getStartPosition();
      const end = selection.getEndPosition();

      // Check before selection
      const hasNewlineBefore =
        start.column === 1 ||
        model.getValueInRange(
          new Range(
            start.lineNumber,
            Math.max(1, start.column - 1),
            start.lineNumber,
            start.column
          )
        ) === "\n";

      // Check after selection
      const hasNewlineAfter =
        end.column === model.getLineMaxColumn(end.lineNumber) ||
        model.getValueInRange(
          new Range(end.lineNumber, end.column, end.lineNumber, end.column + 1)
        ) === "\n";

      if (!hasNewlineBefore || !hasNewlineAfter) {
        // Add line breaks if needed
        wrappedText = `${!hasNewlineBefore ? "\n" : ""}${wrappedText}${
          !hasNewlineAfter ? "\n" : ""
        }`;
      }
    }

    editorInstance.executeEdits("charInsert", [
      {
        range: selection,
        text: wrappedText,
        forceMoveMarkers: true,
      },
    ]);
    editorInstance.focus();
  }
}

// register shortcuts
buttons.forEach((btn) => {
  if (btn.kbd) editorInstance.addCommand(btn.kbd, btn.action);
});

// upload button
// const uploadBtn = {
//   key: "upload",
//   icon: cdxIconUpload,
//   label: mw.message("wikieditor-toolbar-tool-file-upload").text(),
//   action: () => {
//     showUploadDialog.value = true;
//   },
// };
// const showUploadDialog = ref(false);
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <cdx-button
        v-for="value in buttons"
        :key="value.key"
        :aria-label="value.label"
        v-tooltip:top="value.label"
        @click="value.action"
        weight="quiet"
        type="button"
      >
        <cdx-icon :icon="value.icon" :lang="lang" />
      </cdx-button>
    </div>
    <!-- <cdx-button
      :aria-label="uploadBtn.label"
      type="button"
      @click="uploadBtn.action"
    >
      <cdx-icon :icon="uploadBtn.icon" />
      {{ uploadBtn.label }}
    </cdx-button> -->
  </div>
  <!-- <file-uploader
    :editor-instance="editorInstance"
    v-model:open="showUploadDialog"
  /> -->
  <copilot-btn :get-new-content="() => editorInstance.getValue()" />
</template>

<style scoped lang="css">
.toolbar {
  padding: 0.25rem;
  margin-bottom: -4px;
  display: flex;
  justify-content: space-between;
  gap: 0.25rem;
  background-color: var(--container);
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
}
.toolbar-left {
  display: flex;
  gap: 0.25rem;
}
</style>
