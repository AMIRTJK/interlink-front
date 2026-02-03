import "./DocumentEditorStyle.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  DecoupledEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Font,
  Alignment,
  Link,
  BlockQuote,
  PageBreak,
  CloudServices,
} from "ckeditor5";

import {
  FormatPainter,
  Pagination,
  ExportPdf,
  ExportWord,
} from "ckeditor5-premium-features";

import "ckeditor5/ckeditor5.css";
import "ckeditor5-premium-features/ckeditor5-premium-features.css";
import { useRef, useState } from "react";
import { If } from "@shared/ui";
const licenseKey =
  "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzA5NDA3OTksImp0aSI6IjYxNmUzMTYzLTAwNDItNDYzYS05MWZmLWViNDA4MjIxMzZmNiIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6Ijc4NTQzYmQ2In0.5fu9jpzMqZ6Y0vptqRSnt55NplhFPsSYrP2HfYpxdz3OYmKpYo0EBUn5Mgv-LaTCScJoOXiDs3t-VB9xNMarfA";

interface DocumentEditorProps {
  isDarkMode: boolean;
  mode: string;
  onChange?: (data: string) => void;
  initialContent?: string; // Новый проп
}

export const DocumentEditor = ({
  isDarkMode,
  mode,
  onChange,
  initialContent = "",
}: DocumentEditorProps) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isEditorHovered, setIsEditorHovered] = useState(false);

  const isReadyModeEditor = mode === "show";

  const toolbarBg = isDarkMode
    ? "rgba(31, 41, 55, 0.9)"
    : "rgba(255, 255, 255, 0.9)";

  const toolbarBorder = isDarkMode
    ? "rgba(75, 85, 99, 0.3)"
    : "rgba(229, 231, 235, 0.5)";

  return (
    <div
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={() => setIsEditorHovered(true)}
      onMouseLeave={() => setIsEditorHovered(false)}
    >
      <If is={!isReadyModeEditor}>
        <div
          ref={toolbarRef}
          className={`custom-toolbar-container ${isDarkMode ? "dark" : ""} ${
            isEditorHovered ? "visible" : ""
          }`}
          style={{
            backgroundColor: toolbarBg,
            borderColor: toolbarBorder,
            backdropFilter: "blur(12px)",
            opacity: isEditorHovered ? 1 : 0,
            transform: `translate(-50%, ${isEditorHovered ? "0px" : "10px"})`,
            pointerEvents: isEditorHovered ? "auto" : "none",
          }}
        ></div>
      </If>
      <div
        className="custom-editor rounded-3xl overflow-auto shadow-xl border transition-all duration-300"
        style={{
          height: "30cm",
          backgroundColor: isDarkMode
            ? "rgba(31, 41, 55, 0.4)"
            : "rgba(255, 255, 255, 0.8)",
          borderColor: isDarkMode
            ? "rgba(75, 85, 99, 0.3)"
            : "rgba(229, 231, 235, 0.5)",
          backdropFilter: "blur(20px)",
        }}
      >
        <CKEditor
          editor={DecoupledEditor}
          disabled={isReadyModeEditor}
          data={initialContent}
          onReady={(editor) => {
            const toolbarElement = editor.ui.view.toolbar.element;

            if (toolbarRef.current && toolbarElement) {
              toolbarRef.current.appendChild(toolbarElement);
            }
          }}
          onChange={(event, editor) => {
            const data = editor.getData();
            if (onChange) {
              onChange(data);
            }
          }}
          config={{
            licenseKey: licenseKey,
            plugins: [
              Essentials,
              Paragraph,
              Bold,
              Italic,
              FormatPainter,
              Font,
              Alignment,
              Link,
              BlockQuote,
              PageBreak,
              Pagination,
              CloudServices,
              ExportPdf,
              ExportWord,
            ],
            toolbar: {
              items: [
                "fontSize",
                "|",
                "bold", // B
                "italic", // I
                "|",
                "alignment", // Выравнивание
                "link", // Ссылка (Цепочка)
                "|",
                "blockQuote", // Заглушка для "Скрепки" (последний элемент)
                "pageBreak", // Кнопка для ручного разрыва страницы
                "|",
                "exportPdf",
                "exportWord",
                "|",
                "previousPage", // Кнопки навигации по страницам (от Pagination)
                "nextPage",
                "pageNavigation",
              ],
              shouldNotGroupWhenFull: true,
            },
            exportPdf: {
              fileName: "my-sample-file.pdf",
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
              fileName: "my-sample-file.docx",
              converterOptions: {
                document: {
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
            pagination: {
              pageWidth: "21cm",
              pageHeight: "29.7cm",

              pageMargins: {
                top: "20mm",
                bottom: "20mm",
                left: "20mm",
                right: "20mm",
              },
            },
            fontSize: {
              options: [10, 12, 14, "default", 18, 20, 24],
            },
            placeholder: "Type the content here!",
          }}
        />
      </div>
    </div>
  );
};
