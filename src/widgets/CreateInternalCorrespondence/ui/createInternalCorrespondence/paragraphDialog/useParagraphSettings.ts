import { useCallback, useRef, useState, type RefObject } from "react";

import { DEFAULT_PARAGRAPH_FORMAT, type IParagraphFormat } from "./model";
import {
  applyParagraphFormat,
  collectParagraphTargets,
  readParagraphFormat,
} from "./paragraphFormat";
import {
  readParagraphSelection,
  restoreParagraphSelection,
} from "./paragraphSelection";

interface IParams {
  editorRef: RefObject<HTMLDivElement | null>;
  syncEditorAfterDomEdit: () => void;
  commitHistoryNow: () => void;
  refreshActiveFmt: () => void;
}

/**
 * Диалог «Абзац»: снимает настройки абзаца под курсором при открытии и
 * применяет их ко всем абзацам выделения при подтверждении.
 *
 * Выделение запоминается в момент открытия: фокус уходит в поля диалога, и к
 * моменту «ОК» живого выделения в редакторе уже нет.
 */
export const useParagraphSettings = ({
  editorRef,
  syncEditorAfterDomEdit,
  commitHistoryNow,
  refreshActiveFmt,
}: IParams) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialFormat, setInitialFormat] = useState<IParagraphFormat>(
    DEFAULT_PARAGRAPH_FORMAT,
  );
  const [hasListTarget, setHasListTarget] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  const openDialog = useCallback(() => {
    const editor = editorRef.current;
    // contentEditable=false — «только чтение» (подписано / старая версия).
    if (!editor || !editor.isContentEditable) return;

    const sel = window.getSelection();
    const range =
      sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)
        ? sel.getRangeAt(0).cloneRange()
        : null;
    savedRangeRef.current = range;

    const targets = collectParagraphTargets(editor, range);
    setInitialFormat(
      targets[0] ? readParagraphFormat(targets[0]) : DEFAULT_PARAGRAPH_FORMAT,
    );
    setHasListTarget(targets.some((block) => block.tagName === "LI"));
    setIsOpen(true);
  }, [editorRef]);

  const closeDialog = useCallback(() => setIsOpen(false), []);

  const applyFormat = useCallback(
    (fmt: IParagraphFormat) => {
      setIsOpen(false);
      const editor = editorRef.current;
      if (!editor || !editor.isContentEditable) return;

      const targets = collectParagraphTargets(editor, savedRangeRef.current);
      if (!targets.length) return;

      // Набор до применения — отдельный шаг истории; сама правка зафиксируется
      // в syncEditorAfterDomEdit.
      commitHistoryNow();
      const selection = readParagraphSelection(targets, savedRangeRef.current);
      const applied = applyParagraphFormat(targets, fmt);

      editor.focus();
      savedRangeRef.current = null;

      // Отступы и интервалы меняют высоту блоков — постраничную разбивку
      // пересчитываем сразу, не дожидаясь rAF-цепочки. Выделение возвращаем
      // после неё: пагинатор переставляет блоки и по пути двигает каретку.
      syncEditorAfterDomEdit();
      restoreParagraphSelection(applied, selection);
      refreshActiveFmt();
    },
    [editorRef, syncEditorAfterDomEdit, commitHistoryNow, refreshActiveFmt],
  );

  return {
    paragraphDialogOpen: isOpen,
    paragraphInitialFormat: initialFormat,
    paragraphLevelDisabled: hasListTarget,
    openParagraphDialog: openDialog,
    closeParagraphDialog: closeDialog,
    applyParagraphFormat: applyFormat,
  };
};
