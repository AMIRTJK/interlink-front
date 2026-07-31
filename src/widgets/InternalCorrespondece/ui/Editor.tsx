import "./EditorStyle.css";

import {
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { DecoupledEditor, type EditorConfig } from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import "ckeditor5-premium-features/ckeditor5-premium-features.css";
import { buildEditorConfig } from "../lib/editorConfig";
import { configUpdateAlert } from "../lib/configUpdateAlert";

export interface EditorHandle {
  insertHtml: (htmlContent: string) => void;
  setContent: (content: string) => void;
}

interface EditorProps {
  onChange?: (data: string) => void;
  initialContent?: string;
  type: string;
  isIncoming?: boolean;
  isReadOnly?: boolean;
  isPreviewOpen?: boolean;
  isReadPage?: boolean;
  isDarkMode?: boolean;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(
  (
    {
      onChange,
      initialContent = "",
      isIncoming,
      isReadOnly,
      isPreviewOpen,
      isReadPage = false,
      isDarkMode,
    },
    ref,
  ) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorMenuBarRef = useRef<HTMLDivElement>(null);
    const editorToolbarRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    const editorInstanceRef = useRef<DecoupledEditor | null>(null);

    useImperativeHandle(ref, () => ({
      insertHtml: (htmlContent: string) => {
        const editor = editorInstanceRef.current;
        if (editor) {
          editor.model.change(() => {
            const viewFragment = editor.data.processor.toView(htmlContent);
            const modelFragment = editor.data.toModel(viewFragment);
            editor.model.insertContent(modelFragment);
          });
        }
      },
      setContent: (content: string) => {
        const editor = editorInstanceRef.current;
        if (editor) {
          editor.setData(content);
        }
      },
    }));

    const { editorConfig } = useMemo<{
      editorConfig: EditorConfig;
    }>(() => {
      return {
        editorConfig: buildEditorConfig(isReadPage),
      };
    }, [isReadPage]);

    useEffect(() => {
      if (editorConfig) {
        configUpdateAlert(editorConfig);
      }
    }, [editorConfig]);

    return (
      <div
        className={`main-container ${isDarkMode ? "is-dark ck-theme-dark" : ""}`}
      >
        <div
          className="editor-container editor-container_document-editor editor-container_include-pagination editor-container_include-fullscreen"
          ref={editorContainerRef}
        >
          <div
            className="editor-container__menu-bar"
            ref={editorMenuBarRef}
          ></div>
          <div
            className="editor-container__toolbar"
            ref={editorToolbarRef}
          ></div>
          <div
            className={`${isPreviewOpen ? "custom-editor-container__editor-wrapper" : isReadPage ? "is-read-page" : "editor-container__editor-wrapper"}`}
          >
            <div className="editor-container__editor">
              <div ref={editorRef}>
                <CKEditor
                  disabled={isIncoming || isPreviewOpen || isReadOnly}
                  data={initialContent}
                  onReady={(editor) => {
                    const decoupledEditor = editor as DecoupledEditor;

                    editorInstanceRef.current = decoupledEditor;

                    if (editorToolbarRef.current) {
                      editorToolbarRef.current.appendChild(
                        decoupledEditor.ui.view.toolbar.element!,
                      );
                    }

                    // --- Настройка Tab (Работает как Индетация) ---
                    decoupledEditor.keystrokes.set("Tab", (_, cancel) => {
                      const command = decoupledEditor.commands.get("indent");
                      if (command && command.isEnabled) {
                        decoupledEditor.execute("indent");
                        cancel();
                      }
                    });

                    // --- Настройка Backspace (Умный Outdent) ---
                    decoupledEditor.keystrokes.set("Backspace", (_, cancel) => {
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
                    });
                  }}
                  onAfterDestroy={() => {
                    editorInstanceRef.current = null;

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
                  onChange={(_, editor) => {
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
  },
);
