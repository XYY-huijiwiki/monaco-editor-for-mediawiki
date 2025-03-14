import type { Button, Tooltip } from "@fluentui/web-components";
import "@fluentui/web-components/toggle-button.js";
import "@fluentui/web-components/button.js";
import "@fluentui/web-components/tooltip.js";
import { editor, Range, KeyCode, KeyMod } from "monaco-editor";
import iconBold from "./assets/icons/FluentTextBold24Regular.svg?raw";
import iconItalic from "./assets/icons/FluentTextItalic24Regular.svg?raw";
import iconSup from "./assets/icons/FluentTextSuperscript24Regular.svg?raw";
import iconSub from "./assets/icons/FluentTextSubscript24Regular.svg?raw";
import iconRef from "./assets/icons/FluentBook24Regular.svg?raw";
import iconImage from "./assets/icons/FluentImage24Regular.svg?raw";
import iconGallery from "./assets/icons/FluentImageMultiple24Regular.svg?raw";
import iconLink from "./assets/icons/FluentLink24Regular.svg?raw";

async function genToolbar(editor: editor.IStandaloneCodeEditor) {
  const toolbar = document.createElement("div");
  toolbar.classList.add("me4m-toolbar");

  // charInsert: bold
  const boldButton = document.createElement("fluent-button") as Button;
  boldButton.innerHTML = iconBold;
  boldButton.iconOnly = true;
  boldButton.onclick = () =>
    charInsert(
      editor,
      "'''+'''",
      mw.message("wikieditor-toolbar-tool-bold-example").text()
    );
  boldButton.id = "boldButton";
  toolbar.appendChild(boldButton);
  toolbar.appendChild(
    genTooltip(mw.message("wikieditor-toolbar-tool-bold").text(), "boldButton")
  );
  // keyboard shortcut
  editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyB, () => {
    charInsert(
      editor,
      "'''+'''",
      mw.message("wikieditor-toolbar-tool-bold-example").text()
    );
  });

  // charInsert: italic
  const italicButton = document.createElement("fluent-button") as Button;
  italicButton.innerHTML = iconItalic;
  italicButton.iconOnly = true;
  italicButton.onclick = () =>
    charInsert(
      editor,
      "''+''",
      mw.message("wikieditor-toolbar-tool-italic-example").text()
    );
  italicButton.id = "italicButton";
  toolbar.appendChild(italicButton);
  toolbar.appendChild(
    genTooltip(
      mw.message("wikieditor-toolbar-tool-italic").text(),
      "italicButton"
    )
  );
  // keyboard shortcut
  editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyI, () => {
    charInsert(
      editor,
      "''+''",
      mw.message("wikieditor-toolbar-tool-italic-example").text()
    );
  });

  // charInsert: superscript
  const supButton = document.createElement("fluent-button") as Button;
  supButton.innerHTML = iconSup;
  supButton.iconOnly = true;
  supButton.id = "supButton";
  supButton.onclick = () =>
    charInsert(
      editor,
      "<sup>+</sup>",
      mw.message("wikieditor-toolbar-tool-superscript-example").text()
    );
  toolbar.appendChild(supButton);
  toolbar.appendChild(
    genTooltip(
      mw.message("wikieditor-toolbar-tool-superscript").text(),
      "supButton"
    )
  );

  // charInsert: subscript
  const subButton = document.createElement("fluent-button") as Button;
  subButton.innerHTML = iconSub;
  subButton.iconOnly = true;
  subButton.id = "subButton";
  subButton.onclick = () =>
    charInsert(
      editor,
      "<sub>+</sub>",
      mw.message("wikieditor-toolbar-tool-subscript-example").text()
    );
  toolbar.appendChild(subButton);
  toolbar.appendChild(
    genTooltip(
      mw.message("wikieditor-toolbar-tool-subscript").text(),
      "subButton"
    )
  );

  // charInsert: reference
  const refButton = document.createElement("fluent-button") as Button;
  refButton.innerHTML = iconRef;
  refButton.iconOnly = true;
  refButton.id = "refButton";
  refButton.onclick = () =>
    charInsert(
      editor,
      "<ref>+</ref>",
      mw.message("wikieditor-toolbar-tool-reference-example").text()
    );
  toolbar.appendChild(refButton);
  toolbar.appendChild(
    genTooltip(
      mw.message("wikieditor-toolbar-tool-reference").text(),
      "refButton"
    )
  );

  // charInsert: link
  const linkButton = document.createElement("fluent-button") as Button;
  linkButton.innerHTML = iconLink;
  linkButton.iconOnly = true;
  linkButton.disabled = true;
  toolbar.appendChild(linkButton);

  // charInsert: image
  const imageButton = document.createElement("fluent-button") as Button;
  imageButton.innerHTML = iconImage;
  imageButton.iconOnly = true;
  imageButton.id = "imageButton";
  imageButton.onclick = () =>
    charInsert(
      editor,
      "[[文件:+|缩略图]]",
      mw.message("wikieditor-toolbar-tool-file-example").text()
    );
  toolbar.appendChild(imageButton);
  toolbar.appendChild(
    genTooltip(mw.message("wikieditor-toolbar-tool-file").text(), "imageButton")
  );

  // charInsert: gallery
  const galleryButton = document.createElement("fluent-button") as Button;
  galleryButton.innerHTML = iconGallery;
  galleryButton.iconOnly = true;
  galleryButton.id = "galleryButton";
  galleryButton.onclick = () =>
    charInsert(
      editor,
      "<gallery>\n+\n</gallery>",
      mw.message("wikieditor-toolbar-tool-gallery-example").text(),
      true
    );
  toolbar.appendChild(galleryButton);
  toolbar.appendChild(
    genTooltip(
      mw.message("wikieditor-toolbar-tool-gallery").text(),
      "galleryButton"
    )
  );

  // append the toolbar to the editor
  const controlEle = document.querySelector(
    ".wikiEditor-ui-controls"
  ) as HTMLDivElement | null;
  if (controlEle) {
    controlEle.style.backgroundColor = "transparent";
    controlEle.appendChild(toolbar);
  }
}

function charInsert(
  editor: editor.IStandaloneCodeEditor,
  pattern: string,
  placeholderText: string = "",
  isBlock: boolean = false
): void {
  const splitIndex = pattern.indexOf("+");
  const [left, right] =
    splitIndex === -1
      ? [pattern, ""]
      : [pattern.substring(0, splitIndex), pattern.substring(splitIndex + 1)];

  const model = editor.getModel();
  const selection = editor.getSelection();

  if (!model || !selection) return;

  if (selection.isEmpty()) {
    const position = editor.getPosition();
    if (!position) return;

    if (isBlock) {
      // Block mode handling with line breaks
      const currentLine = model.getLineContent(position.lineNumber);
      const beforeCursor = currentLine.substring(0, position.column - 1);
      const afterCursor = currentLine.substring(position.column - 1);

      const needsPreNewline = beforeCursor.length > 0;
      const needsPostNewline = afterCursor.length > 0;

      const insertText =
        (needsPreNewline ? "\n" : "") +
        left +
        placeholderText +
        right +
        (needsPostNewline ? "\n" : "");

      // Execute insertion
      editor.executeEdits("charInsert", [
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

      editor.setSelection(
        new Range(startLine, startColumn, startLine, endColumn)
      );
    } else {
      // Original inline handling
      const insertText = left + placeholderText + right;
      editor.executeEdits("charInsert", [
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
      editor.setSelection(
        new Range(
          position.lineNumber,
          startColumn,
          position.lineNumber,
          endColumn
        )
      );
    }
    editor.focus();
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

    editor.executeEdits("charInsert", [
      {
        range: selection,
        text: wrappedText,
        forceMoveMarkers: true,
      },
    ]);
    editor.focus();
  }
}

function genTooltip(text: string, anchor: string): Tooltip {
  const tooltip = document.createElement("fluent-tooltip") as Tooltip;
  tooltip.textContent = text;
  tooltip.anchor = anchor;
  return tooltip;
}

export default genToolbar;
