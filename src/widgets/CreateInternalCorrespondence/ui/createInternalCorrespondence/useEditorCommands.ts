import {
  useCallback,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import {
  insertFragmentIntoEditor,
  insertPageBreakAtCaret,
  removePageBlocks,
} from "./editorPageOps";

interface IParams {
  editorRef: RefObject<HTMLDivElement | null>;
  pageStride: number;
  syncEditorAfterDomEdit: () => void;
  commitHistoryNow: () => void;
  setPageToDelete: Dispatch<SetStateAction<number | null>>;
}

/**
 * Команды правки документа, меняющие структуру страниц: ручной разрыв, удаление
 * страницы и вставка готового фрагмента. У всех трёх один сценарий — зафиксировать
 * предыдущий набор отдельным шагом истории, поправить DOM, синхронно пересчитать
 * постраничную разбивку.
 */
export const useEditorCommands = ({
  editorRef,
  pageStride,
  syncEditorAfterDomEdit,
  commitHistoryNow,
  setPageToDelete,
}: IParams) => {
  // Ручной разрыв страницы: текст после курсора начинается с нового листа.
  const insertPageBreak = useCallback(() => {
    const editor = editorRef.current;
    // contentEditable=false означает режим «только чтение» (подписано/старая версия)
    if (!editor || !editor.isContentEditable) return;
    // Набор до разрыва — отдельный шаг истории; сам разрыв зафиксирует
    // syncEditorAfterDomEdit в конце.
    commitHistoryNow();
    editor.focus();

    insertPageBreakAtCaret(editor);

    syncEditorAfterDomEdit();
  }, [editorRef, syncEditorAfterDomEdit, commitHistoryNow]);

  // Удаление конкретной страницы: убираем блоки, визуально расположенные на ней,
  // плюс породивший её ручной разрыв. Так не нужно вручную стирать весь текст.
  // Операция обратима через собственную историю изменений (Ctrl+Z),
  // подтверждение оставлено как защита от случайного клика.
  const deletePage = useCallback(
    (pageIndex: number) => {
      const editor = editorRef.current;
      setPageToDelete(null);
      if (!editor || !editor.isContentEditable) return;
      // Правки до удаления страницы — отдельный шаг истории.
      commitHistoryNow();

      if (!removePageBlocks(editor, pageIndex, pageStride)) return;

      syncEditorAfterDomEdit();
    },
    [
      editorRef,
      pageStride,
      syncEditorAfterDomEdit,
      commitHistoryNow,
      setPageToDelete,
    ],
  );

  // Вставка готового DOM-фрагмента в позицию курсора (или в конец, если фокуса
  // нет). Используется и при Ctrl+V, и при импорте Word-файла, чтобы вставка
  // вела себя одинаково и корректно пересчитывала постраничную разбивку.
  const insertFragmentAtCaret = useCallback(
    (fragment: DocumentFragment) => {
      const editor = editorRef.current;
      if (!editor) return;
      // Набор текста до вставки — отдельный шаг истории; сама вставка
      // зафиксируется в syncEditorAfterDomEdit ниже.
      commitHistoryNow();
      editor.focus();

      insertFragmentIntoEditor(editor, fragment);

      // Пагинация синхронно, а не через rAF: при серии быстрых вставок каждая
      // следующая ложится в уже разложенный документ с актуальными распорками,
      // а не в «хвост» с устаревшей разметкой — без случайных пустых
      // промежутков и лишних отступов.
      syncEditorAfterDomEdit();
    },
    [editorRef, syncEditorAfterDomEdit, commitHistoryNow],
  );

  return { insertPageBreak, deletePage, insertFragmentAtCaret };
};
