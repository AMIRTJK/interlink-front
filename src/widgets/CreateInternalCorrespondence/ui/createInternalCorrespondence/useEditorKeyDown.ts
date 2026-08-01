import { useCallback, type RefObject } from "react";

import { handleArrowKey } from "./editorKeyArrows";
import { handleDeleteKeys } from "./editorKeyDelete";
import { handleEnterKey, handleSoftBreakKey } from "./editorKeyEnter";
import { handleTabKey } from "./editorKeyTab";
import type { IEditorKeyDeps, TEditorKeyEvent } from "./editorKeyModel";

interface IParams extends IEditorKeyDeps {
  editorRef: RefObject<HTMLDivElement | null>;
  undoEdit: () => void;
  redoEdit: () => void;
}

// Порядок важен: обработчики пробуются сверху вниз, первый вернувший true
// забирает событие себе.
const KEY_HANDLERS = [
  handleSoftBreakKey,
  handleEnterKey,
  handleTabKey,
  handleArrowKey,
  handleDeleteKeys,
];

/**
 * Клавиатура редактора. Tab — выделяемый табулятор (прогон неразрывных
 * пробелов). Backspace/Delete на границе страниц — управляемое слияние блоков:
 * дефолтное поведение браузера рядом с contenteditable=false распоркой прыгает
 * курсором и теряет текст. Разбор конкретных клавиш — в editorKey*-модулях.
 */
export const useEditorKeyDown = ({
  editorRef,
  undoEdit,
  redoEdit,
  syncEditorAfterDomEdit,
  commitHistoryNow,
  execCmd,
}: IParams) =>
  useCallback(
    (e: TEditorKeyEvent) => {
      // Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z — только собственная история. Нативную
      // отмену браузера глушим всегда: её стек разрушен программными правками
      // пагинации и восстанавливает непредсказуемые старые состояния.
      // e.code вместо e.key — чтобы работало и в русской раскладке (Ctrl+Я).
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.code === "KeyZ") {
          e.preventDefault();
          if (e.shiftKey) redoEdit();
          else undoEdit();
          return;
        }
        if (e.code === "KeyY" && !e.shiftKey) {
          e.preventDefault();
          redoEdit();
          return;
        }
      }

      const editor = editorRef.current;
      const deps = { syncEditorAfterDomEdit, commitHistoryNow, execCmd };
      for (const handle of KEY_HANDLERS) {
        if (handle(e, editor, deps)) return;
      }
    },
    [
      editorRef,
      syncEditorAfterDomEdit,
      commitHistoryNow,
      undoEdit,
      redoEdit,
      execCmd,
    ],
  );
