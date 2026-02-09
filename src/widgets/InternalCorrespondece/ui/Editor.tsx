/**
 * This configuration was generated using the CKEditor 5 Builder. You can modify it anytime using this link:
 * https://ckeditor.com/ckeditor-5/builder/?redirect=docs#installation/NoDgNARATAdAnDAjBSiRQOyIAxu17OKEAZkQwDY4KAWGikAVhpIu2xKihow6+xCIaRGthQQApgDsUJMMERhF2JauwBdSFABmAI20gMUCOqA=
 */

import "./EditorStyle.css";

import { useEffect, useRef, useMemo } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  DecoupledEditor,
  Autosave,
  Essentials,
  Paragraph,
  Autoformat,
  TextTransformation,
  Mention,
  ImageUtils,
  ImageEditing,
  FindAndReplace,
  PasteFromOffice,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Code,
  FontFamily,
  FontSize,
  RemoveFormat,
  Alignment,
  AutoLink,
  HorizontalLine,
  ImageBlock,
  ImageToolbar,
  ImageInline,
  ImageInsertViaUrl,
  AutoImage,
  ImageResize,
  CKBoxImageEdit,
  CKBox,
  CloudServices,
  ImageUpload,
  ImageInsert,
  PictureEditing,
  ImageStyle,
  LinkImage,
  ImageCaption,
  ImageTextAlternative,
  List,
  ListProperties,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  TableColumnResize,
  TableCaption,
  Emoji,
  SpecialCharactersArrows,
  SpecialCharacters,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Fullscreen,
  PageBreak,
  BalloonToolbar,
  Indent,
  IndentBlock,
  type EditorConfig,
} from "ckeditor5";
import {
  SlashCommand,
  TableOfContents,
  Template,
  CaseChange,
  ExportWord,
  ExportPdf,
  ImportWord,
  PasteFromOfficeEnhanced,
  Pagination,
  LineHeight,
  Footnotes,
} from "ckeditor5-premium-features";

import "ckeditor5/ckeditor5.css";
import "ckeditor5-premium-features/ckeditor5-premium-features.css";
import { EXPORT_FIX_STYLES } from "../lib/constance";

const LICENSE_KEY =
  "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzA5NDA3OTksImp0aSI6IjYxNmUzMTYzLTAwNDItNDYzYS05MWZmLWViNDA4MjIxMzZmNiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6Ijc4NTQzYmQ2In0.5fu9jpzMqZ6Y0vptqRSnt55NplhFPsSYrP2HfYpxdz3OYmKpYo0EBUn5Mgv-LaTCScJoOXiDs3t-VB9xNMarfA";

const CLOUD_SERVICES_TOKEN_URL =
  "https://ioglmntruvtk.cke-cs.com/token/dev/925bd59ad4d96dda6fe1a50a68584663007b074351c0aa49fd4566b1f553?limit=10";

interface EditorProps {
  onChange?: (data: string) => void;
  initialContent?: string;
}

export const Editor = ({ onChange, initialContent = "" }: EditorProps) => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorMenuBarRef = useRef<HTMLDivElement>(null);
  const editorToolbarRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const { editorConfig } = useMemo<{
    editorConfig: EditorConfig;
  }>(() => {
    return {
      editorConfig: {
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "previousPage",
            "nextPage",
            "|",
            "heading",
            "|",
            "fontSize",
            "fontFamily",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "insertImage",
            "|",
            "alignment",
            "lineHeight",
            "|",
            "bulletedList",
            "numberedList",
            "exportPdf",
            "exportWord",
            "importWord",
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          Alignment,
          Autoformat,
          AutoImage,
          AutoLink,
          Autosave,
          BalloonToolbar,
          Bold,
          CaseChange,
          CKBox,
          CKBoxImageEdit,
          CloudServices,
          Code,
          Emoji,
          Essentials,
          ExportPdf,
          ExportWord,
          FindAndReplace,
          FontFamily,
          FontSize,
          Footnotes,
          Fullscreen,
          Heading,
          HorizontalLine,
          ImageBlock,
          ImageCaption,
          ImageEditing,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          ImageUtils,
          ImportWord,
          Indent,
          IndentBlock,
          Italic,
          LineHeight,
          LinkImage,
          List,
          ListProperties,
          Mention,
          PageBreak,
          Pagination,
          Paragraph,
          PasteFromOffice,
          PasteFromOfficeEnhanced,
          PictureEditing,
          RemoveFormat,
          SlashCommand,
          SpecialCharacters,
          SpecialCharactersArrows,
          SpecialCharactersCurrency,
          SpecialCharactersEssentials,
          SpecialCharactersLatin,
          SpecialCharactersMathematical,
          SpecialCharactersText,
          Strikethrough,
          Subscript,
          Superscript,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableOfContents,
          TableProperties,
          TableToolbar,
          Template,
          TextTransformation,
          Underline,
        ],
        indentBlock: {
          offset: 40,
          unit: "px",
        },
        balloonToolbar: [
          "bold",
          "italic",
          "|",
          "insertImage",
          "|",
          "bulletedList",
          "numberedList",
        ],
        cloudServices: {
          tokenUrl: CLOUD_SERVICES_TOKEN_URL,
        },
        exportPdf: {
          stylesheets: [
            "https://cdn.ckeditor.com/ckeditor5/47.4.0/ckeditor5.css",
            "https://cdn.ckeditor.com/ckeditor5-premium-features/47.4.0/ckeditor5-premium-features.css",
            EXPORT_FIX_STYLES,
          ],
          fileName: "export-pdf-demo.pdf",
          converterOptions: {
            format: "A4",
            margin_top: "20mm",
            margin_bottom: "20mm",
            margin_right: "12mm",
            margin_left: "12mm",
            page_orientation: "portrait",
          },
        },
        exportWord: {
          stylesheets: [
            "https://cdn.ckeditor.com/ckeditor5/47.4.0/ckeditor5.css",
            "https://cdn.ckeditor.com/ckeditor5-premium-features/47.4.0/ckeditor5-premium-features.css",
            EXPORT_FIX_STYLES,
          ],
          fileName: "export-word-demo.docx",
          converterOptions: {
            document: {
              orientation: "portrait",
              size: "A4",
              margins: {
                top: "20mm",
                bottom: "20mm",
                right: "12mm",
                left: "12mm",
              },
            },
          },
        },
        fontFamily: {
          supportAllValues: true,
        },
        fontSize: {
          options: [
            {
              model: "10pt",
              title: "10pt",
              view: {
                name: "span",
                styles: {
                  "font-size": "10pt",
                },
              },
            },
            {
              model: "12pt",
              title: "12pt",
              view: {
                name: "span",
                styles: {
                  "font-size": "12pt",
                },
              },
            },
            {
              model: "14pt",
              title: "14pt",
              view: {
                name: "span",
                styles: {
                  "font-size": "14pt",
                },
              },
            },
            {
              model: "18pt",
              title: "18pt",
              view: {
                name: "span",
                styles: {
                  "font-size": "18pt",
                },
              },
            },
            {
              model: "24pt",
              title: "24pt",
              view: {
                name: "span",
                styles: {
                  "font-size": "24pt",
                },
              },
            },
            "default",
          ],
          supportAllValues: true, // Разрешает ввод ручных значений (они могут быть в px)
        },
        fullscreen: {
          onEnterCallback: (container: HTMLElement) =>
            container.classList.add(
              "editor-container",
              "editor-container_document-editor",
              "editor-container_include-pagination",
              "editor-container_include-fullscreen",
              "main-container",
            ),
        },
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Paragraph",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Heading 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: "h4",
              title: "Heading 4",
              class: "ck-heading_heading4",
            },
            {
              model: "heading5",
              view: "h5",
              title: "Heading 5",
              class: "ck-heading_heading5",
            },
            {
              model: "heading6",
              view: "h6",
              title: "Heading 6",
              class: "ck-heading_heading6",
            },
          ],
        },
        image: {
          toolbar: [
            "toggleImageCaption",
            "imageTextAlternative",
            "|",
            "imageStyle:inline",
            "imageStyle:wrapText",
            "imageStyle:breakText",
            "|",
            "resizeImage",
            "|",
            "ckboxImageEdit",
          ],
        },
        licenseKey: LICENSE_KEY,
        lineHeight: {
          supportAllValues: true,
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        mention: {
          feeds: [
            {
              marker: "@",
              feed: [
                /* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
              ],
            },
          ],
        },
        pagination: {
          pageWidth: "21cm",
          pageHeight: "29.7cm",
          pageMargins: {
            top: "20mm",
            bottom: "20mm",
            right: "12mm",
            left: "12mm",
          },
        },
        table: {
          contentToolbar: [
            "tableColumn",
            "tableRow",
            "tableProperties",
            "tableCellProperties",
          ],
        },
        template: {
          definitions: [
            {
              title: "Introduction",
              description: "Simple introduction to an article",
              icon: '<svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <g id="icons/article-image-right">\n        <rect id="icon-bg" width="45" height="45" rx="2" fill="#A5E7EB"/>\n        <g id="page" filter="url(#filter0_d_1_507)">\n            <path d="M9 41H36V12L28 5H9V41Z" fill="white"/>\n            <path d="M35.25 12.3403V40.25H9.75V5.75H27.7182L35.25 12.3403Z" stroke="#333333" stroke-width="1.5"/>\n        </g>\n        <g id="image">\n            <path id="Rectangle 22" d="M21.5 23C21.5 22.1716 22.1716 21.5 23 21.5H31C31.8284 21.5 32.5 22.1716 32.5 23V29C32.5 29.8284 31.8284 30.5 31 30.5H23C22.1716 30.5 21.5 29.8284 21.5 29V23Z" fill="#B6E3FC" stroke="#333333"/>\n            <path id="Vector 1" d="M24.1184 27.8255C23.9404 27.7499 23.7347 27.7838 23.5904 27.9125L21.6673 29.6268C21.5124 29.7648 21.4589 29.9842 21.5328 30.178C21.6066 30.3719 21.7925 30.5 22 30.5H32C32.2761 30.5 32.5 30.2761 32.5 30V27.7143C32.5 27.5717 32.4391 27.4359 32.3327 27.3411L30.4096 25.6268C30.2125 25.451 29.9127 25.4589 29.7251 25.6448L26.5019 28.8372L24.1184 27.8255Z" fill="#44D500" stroke="#333333" stroke-linejoin="round"/>\n            <circle id="Ellipse 1" cx="26" cy="25" r="1.5" fill="#FFD12D" stroke="#333333"/>\n        </g>\n        <rect id="Rectangle 23" x="13" y="13" width="12" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 24" x="13" y="17" width="19" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 25" x="13" y="21" width="6" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 26" x="13" y="25" width="6" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 27" x="13" y="29" width="6" height="2" rx="1" fill="#B4B4B4"/>\n        <rect id="Rectangle 28" x="13" y="33" width="16" height="2" rx="1" fill="#B4B4B4"/>\n    </g>\n    <defs>\n        <filter id="filter0_d_1_507" x="9" y="5" width="28" height="37" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">\n            <feFlood flood-opacity="0" result="BackgroundImageFix"/>\n            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>\n            <feOffset dx="1" dy="1"/>\n            <feComposite in2="hardAlpha" operator="out"/>\n            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.29 0"/>\n            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_507"/>\n            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_507" result="shape"/>\n        </filter>\n    </defs>\n</svg>\n',
              data: "<h2>Introduction</h2><p>In today's fast-paced world, keeping up with the latest trends and insights is essential for both personal growth and professional development. This article aims to shed light on a topic that resonates with many, providing valuable information and actionable advice. Whether you're seeking to enhance your knowledge, improve your skills, or simply stay informed, our comprehensive analysis offers a deep dive into the subject matter, designed to empower and inspire our readers.</p>",
            },
          ],
        },
      },
    };
  }, []); // Пустой массив зависимостей

  useEffect(() => {
    if (editorConfig) {
      configUpdateAlert(editorConfig);
    }
  }, [editorConfig]);

  return (
    <div className="main-container">
      <div
        className="editor-container editor-container_document-editor editor-container_include-pagination editor-container_include-fullscreen"
        ref={editorContainerRef}
      >
        <div
          className="editor-container__menu-bar"
          ref={editorMenuBarRef}
        ></div>
        <div className="editor-container__toolbar" ref={editorToolbarRef}></div>
        <div className="editor-container__editor-wrapper">
          <div className="editor-container__editor">
            <div ref={editorRef}>
              {/* Проверку editorConfig удаляем, так как он всегда есть */}
              <CKEditor
                data={initialContent}
                onReady={(editor) => {
                  const decoupledEditor = editor as DecoupledEditor;
                  if (editorToolbarRef.current) {
                    editorToolbarRef.current.appendChild(
                      decoupledEditor.ui.view.toolbar.element!,
                    );
                  }

                  // --- Настройка Tab (Работает как Индетация) ---
                  decoupledEditor.keystrokes.set("Tab", (data, cancel) => {
                    const command = decoupledEditor.commands.get("indent");
                    if (command && command.isEnabled) {
                      decoupledEditor.execute("indent");
                      cancel();
                    }
                  });

                  // --- Настройка Backspace (Умный Outdent) ---
                  decoupledEditor.keystrokes.set(
                    "Backspace",
                    (data, cancel) => {
                      const selection =
                        decoupledEditor.model.document.selection;
                      const range = selection.getFirstRange();

                      if (!range || !range.isCollapsed) {
                        return;
                      }

                      const isAtStart = range.start.isAtStart;
                      const command = decoupledEditor.commands.get("outdent");

                      if (isAtStart && command && command.isEnabled) {
                        decoupledEditor.execute("outdent");
                        cancel();
                      }
                    },
                  );
                }}
                onAfterDestroy={() => {
                  if (editorToolbarRef.current) {
                    Array.from(editorToolbarRef.current.children).forEach(
                      (child) => child.remove(),
                    );
                  }
                  if (editorMenuBarRef.current) {
                    Array.from(editorMenuBarRef.current.children).forEach(
                      (child) => child.remove(),
                    );
                  }
                }}
                editor={DecoupledEditor}
                config={editorConfig}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  if (onChange) {
                    onChange(data);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * This function exists to remind you to update the config needed for premium features.
 * The function can be safely removed. Make sure to also remove call to this function when doing so.
 */
let configUpdateAlertShown = false;

function configUpdateAlert(config: EditorConfig) {
  if (configUpdateAlertShown) {
    return;
  }

  const isModifiedByUser = (currentValue: unknown, forbiddenValue: string) => {
    if (currentValue === forbiddenValue) {
      return false;
    }
    if (currentValue === undefined) {
      return false;
    }
    return true;
  };

  const valuesToUpdate: string[] = [];
  configUpdateAlertShown = true;

  if (!isModifiedByUser(config.licenseKey, "<YOUR_LICENSE_KEY>")) {
    valuesToUpdate.push("LICENSE_KEY");
  }

  if (
    !isModifiedByUser(
      config.cloudServices?.tokenUrl,
      "<YOUR_CLOUD_SERVICES_TOKEN_URL>",
    )
  ) {
    valuesToUpdate.push("CLOUD_SERVICES_TOKEN_URL");
  }

  if (valuesToUpdate.length) {
    window.alert(
      [
        "Please update the following values in your editor config",
        "to receive full access to Premium Features:",
        "",
        ...valuesToUpdate.map((value) => ` - ${value}`),
      ].join("\n"),
    );
  }
}
