<template>
  <cdx-dialog
    v-model:open="open"
    :title="t('modal.title')"
    :use-close-button="true"
    @default="open = false"
    style="color-scheme: light dark"
  >
    <div style="display: flex; flex-direction: column; gap: 0.25rem">
      <cdx-message
        >Drag files to editor or
        <a class="cdx-docs-link" href="#" @click="handleFileDialogClick"
          >click here</a
        >
        to upload files.</cdx-message
      >
      <div v-for="(file, idx) in files" :key="file.id">
        <div style="display: flex; gap: 0.25rem">
          <div
            style="position: relative; flex: none; width: 8rem; height: 8rem"
          >
            <div
              v-tooltip:top="
                file.check.content !== '' ? file.check.content : null
              "
            >
              <cdx-image
                :src="file.thumbUrl"
                :alt="t('img.alt')"
                object-fit="contain"
                aspect-ratio="1:1"
                :class="{
                  'ring-red-500 ring-1': file.check.status === 'error',
                  'ring-yellow-500 ring-1': file.check.status === 'warning',
                }"
              />
              <div
                style="
                  right: 0.25rem;
                  bottom: 0.25rem;
                  border-radius: 0.125rem;
                  position: absolute;
                  background: var(--container);
                  padding: 0.25rem;
                  font-size: 0.75rem;
                  color: var(--primary-text-on-container);
                "
              >
                {{
                  file.check.status === "loading"
                    ? `🤔 ${t("status.checking")}`
                    : file.check.status === "ready"
                    ? `👍🏼 ${t("status.ready")}`
                    : file.check.status === "uploaded"
                    ? `✅ ${t("status.uploaded")}`
                    : file.check.status === "warning"
                    ? `⚠️ ${t("status.warning")}`
                    : `❌ ${t("status.error")}`
                }}
              </div>
            </div>
          </div>
          <div
            style="
              display: flex;
              flex-direction: column;
              gap: 0.25rem;
              flex-grow: 1;
            "
          >
            <div style="display: flex; gap: 0.25rem">
              <cdx-text-input
                :placeholder="t('input.filename')"
                v-model="file.filename"
                size="small"
                @input="() => onFilenameChange(file)"
                style="flex: 1 1 0%; width: 0"
              ></cdx-text-input>
              <cdx-button
                type="error"
                size="small"
                tertiary
                @click="removeFile(idx)"
              >
                {{ t("btn.remove") }}
              </cdx-button>
            </div>
            <div style="display: flex; flex-grow: 1">
              <cdx-text-area style="display: flex; flex-grow: 1" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 0.25rem">
        <!-- force upload -->
        <cdx-button
          type="warning"
          :disabled="validatorLock || uploading"
          @click="uploadAll(true)"
          weight="quiet"
        >
          {{ t("btn.uploadWithWarnings") }}
        </cdx-button>
        <!-- normal upload -->
        <cdx-button
          action="progressive"
          :disabled="validatorLock || uploading"
          @click="uploadAll()"
        >
          {{ t("btn.upload") }}
        </cdx-button>
      </div>
    </template>
  </cdx-dialog>
</template>

<script setup lang="ts">
import type { editor } from "monaco-editor";
import { Range } from "@karsten_zhou/utils";
import {
  CdxDialog,
  CdxTextArea,
  CdxTextInput,
  CdxTooltip,
  CdxButton,
  CdxImage,
  CdxMessage,
} from "@wikimedia/codex";
import { ref, watch } from "vue";
import { t } from "../locales";
import { uploadFile } from "../mwApi";

const vTooltip = CdxTooltip;
const { editorInstance } = defineProps<{
  editorInstance: editor.IStandaloneCodeEditor;
}>();
const open = defineModel<boolean>("open", { required: true });
const container = editorInstance.getContainerDomNode();

// Handle file drop
const allowedExts = mw.config.get("wgFileExtensions") as string[];
container.addEventListener("drop", async (event) => {
  event.preventDefault();
  if (!event.dataTransfer) return;
  const newFiles = Array.from(event.dataTransfer.files)
    .map(
      (file) =>
        ({
          id: crypto.randomUUID(),
          filename: file.name,
          file,
          categories: [],
          source: "",
          content: "",
          check: {
            status: "loading",
            content: "",
          },
          thumbUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : "https://huiji-public.huijistatic.com/xyy/uploads/6/6d/File-type-default.png",
        } satisfies UploadListItem)
    )
    .filter(simpleValidator);
  let text = "";
  if (newFiles.length === 0) {
    return;
  } else if (newFiles.length === 1) {
    text = `\n[[文件:${newFiles[0]!.filename}|缩略图]]\n`;
  } else {
    text =
      "\n<gallery>\n" +
      newFiles.map((f) => `${f.filename}`).join("\n") +
      "\n</gallery>\n";
  }

  files.value = files.value.concat(newFiles);
  validatorQueue.value.push(...newFiles);

  // Figure out the drop position in the editor
  const { clientX, clientY } = event;
  const target = editorInstance.getTargetAtClientPoint(clientX, clientY);

  if (target?.position) {
    // Insert text at cursor
    editorInstance.executeEdits("file-drop", [
      {
        range: new Range(
          target.position.lineNumber,
          target.position.column,
          target.position.lineNumber,
          target.position.column
        ),
        text: text,
        forceMoveMarkers: true,
      },
    ]);

    // Move cursor after inserted content
    editorInstance.setPosition({
      lineNumber: target.position.lineNumber,
      column: target.position.column + text.length,
    });
  } else {
    // fallback: replace all text
    editorInstance.setValue(text);
  }
});

type UploadListItem = {
  id: string;
  filename: string;
  file: File;
  categories: string[];
  license?: string;
  source?: string;
  content: string;
  check: {
    status: "loading" | "ready" | "warning" | "error" | "uploaded";
    content: string;
  };
  thumbUrl: string;
};
const files = ref<UploadListItem[]>([]);

function removeFile(idx: number) {
  files.value.splice(idx, 1);
}

function onFilenameChange(file: UploadListItem) {
  const [valid, msg] = simpleValidator(file);
  if (!valid) {
    file.check.status = "error";
    file.check.content = msg;
    return;
  } else {
    file.check.status = "loading";
    file.check.content = "";
    validatorQueue.value.push(file);
  }
}

// validator
type simpleValidatorResult = [boolean, string];
function simpleValidator(file: UploadListItem): simpleValidatorResult {
  const fileExt = file.filename.split(".").pop()?.toLowerCase();
  if (!allowedExts.includes(fileExt || ""))
    return [false, t("fileUploader.invalidFileType", { fileExt })]; // invalid file type
  if (file.file.size > 10 * 1024 * 1024)
    return [false, t("fileUploader.fileTooLarge")]; // 10MB limit
  return [true, ""];
}
type DryRunValidatorResult = ["success" | "warning" | "error", string];
async function dryRunValidator(
  file: UploadListItem
): Promise<DryRunValidatorResult> {
  try {
    const response = await uploadFile({
      filename: file.filename,
      file: file.file,
      text: file.content,
      validateOnly: true,
    });
    if ("upload" in response && response.upload.result === "Success") {
      return ["success", ""];
    } else if ("upload" in response && response.upload.result === "Warning") {
      return ["warning", JSON.stringify(response.upload.warnings, null, 2)];
    } else {
      return ["error", JSON.stringify(response, null, 2)];
    }
  } catch (error: unknown) {
    return ["error", JSON.stringify(error, null, 2)];
  }
}
const validatorLock = ref(false);
const validatorQueue = ref<UploadListItem[]>([]);
watch(
  validatorQueue,
  () => {
    runValidator();
  },
  { deep: true }
);
async function runValidator() {
  if (validatorLock.value) return;
  console.log("triggered");
  validatorLock.value = true;

  while (validatorQueue.value.length > 0) {
    const file = validatorQueue.value.shift();
    console.log("validating...", file);
    if (!file) break;
    const [status, content] = await dryRunValidator(file);
    if (status === "success") {
      file.check.status = "ready";
      file.check.content = "";
    } else if (status === "warning") {
      file.check.status = "warning";
      file.check.content = content;
    } else {
      file.check.status = "error";
      file.check.content = content;
    }
  }

  validatorLock.value = false;
}

// upload
const uploading = ref(false);
async function uploadAll(force = false) {
  uploading.value = true;

  for (let idx = 0; idx < files.value.length; idx++) {
    const file = files.value[idx] as UploadListItem;
    try {
      const response = await uploadFile({
        filename: file.filename,
        file: file.file,
        text: file.content,
        validateOnly: false,
        ignoreWarnings: force,
      });
      if ("upload" in response && response.upload.result === "Success") {
        file!.check.status = "uploaded";
        file!.check.content = "";
      } else if ("upload" in response && response.upload.result === "Warning") {
        file!.check.status = "warning";
        file!.check.content = JSON.stringify(response.upload.warnings, null, 2);
      } else {
        file!.check.status = "error";
        file!.check.content = JSON.stringify(response, null, 2);
      }
    } catch (error: unknown) {
      file.check.status = "error";
      file.check.content = JSON.stringify(error, null, 2);
    }
  }

  uploading.value = false;
}

function handleFileDialogClick(event: MouseEvent) {
  event.preventDefault();
  const input = document.createElement("input");
  input.type = "file";
  input.accept = allowedExts.map((ext) => `.${ext}`).join(",");
  input.multiple = true;
  input.onchange = () => {
    const fileList = input.files;
    if (!fileList) return;
    const newFiles = Array.from(fileList)
      .map(
        (file) =>
          ({
            id: crypto.randomUUID(),
            filename: file.name,
            file,
            categories: [],
            source: "",
            content: "",
            check: {
              status: "loading",
              content: "",
            },
            thumbUrl: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : "https://huiji-public.huijistatic.com/xyy/uploads/6/6d/File-type-default.png",
          } satisfies UploadListItem)
      )
      .filter(simpleValidator);
    if (newFiles.length === 0) {
      return;
    }
    files.value = files.value.concat(newFiles);
    validatorQueue.value.push(...newFiles);
  };
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}
</script>
