import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import { getCaretCharOffset, restoreCaretCharOffset } from "./editorCaret";
import {
  HISTORY_EMPTY_HTML,
  createHistoryStack,
  popUndoState,
  pushUndoState,
  type THistoryState,
} from "./editorHistoryModel";

interface IParams {
  editorRef: RefObject<HTMLDivElement | null>;
  paginateEditorRef: RefObject<(() => number) | null>;
  getCleanEditorHtml: () => string;
  setPageCount: Dispatch<SetStateAction<number>>;
  setEditorContent: Dispatch<SetStateAction<string>>;
}

export const useEditorHistory = ({
  editorRef,
  paginateEditorRef,
  getCleanEditorHtml,
  setPageCount,
  setEditorContent,
}: IParams) => {
  // ===== Собственная история изменений (Undo/Redo) =====
  // Нативным стеком отмены браузера пользоваться нельзя: пагинация постоянно
  // правит DOM программно (распорки, разрезы через innerHTML, замена тела при
  // загрузке версии), такие правки в нативный стек не пишутся, но инвалидируют
  // его записи — Ctrl+Z восстанавливал случайные старые состояния вместе с
  // устаревшими распорками (лишние страницы со старым текстом). Поэтому храним
  // свои снимки: ЧИСТЫЙ HTML (без распорок/разрезов — они пересоздаются
  // пагинацией) + позиция курсора в символах.
  // Гранулярность пошаговая: КАЖДОЕ изменение содержимого (один символ, пробел,
  // табуляция, удаление, вставка, форматирование) образует отдельный шаг, и
  // Ctrl+Z откатывает ровно одно действие. Склейки набора по паузам или по
  // границам слов нет намеренно.
  const historyRef = useRef(createHistoryStack(HISTORY_EMPTY_HTML));
  // Во время применения снимка (undo/redo) и составных правок не фиксируем
  // промежуточные «изменения».
  const suppressHistoryRef = useRef(false);
  // Позиция каретки ДО правки. Снимается на keydown/beforeinput, то есть раньше,
  // чем DOM изменится: иначе отменённый шаг возвращал курсор туда, где он стоял
  // после предыдущего действия, а не туда, где пользователь правит сейчас.
  const caretBeforeEditRef = useRef<number | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(historyRef.current.undo.length > 0);
    setCanRedo(historyRef.current.redo.length > 0);
  }, []);

  // Текущее состояние документа для истории: чистый HTML + курсор в символах.
  // cleanHtml передаёт вызывающий код, если уже посчитал его для стейта:
  // сериализация тела редактора на каждое нажатие клавиши не бесплатна.
  const captureHistoryState = useCallback(
    (cleanHtml?: string): THistoryState => {
      const editor = editorRef.current;
      const caret = editor ? (getCaretCharOffset(editor)?.offset ?? null) : null;
      return { html: cleanHtml ?? getCleanEditorHtml(), caret };
    },
    [getCleanEditorHtml],
  );

  // Фиксация шага: если документ изменился с прошлого шага — прошлое состояние
  // уходит в стек отмены, redo очищается (новая ветка правок).
  const commitHistoryNow = useCallback(
    (cleanHtml?: string) => {
      if (suppressHistoryRef.current) return;
      const h = historyRef.current;
      const cur = captureHistoryState(cleanHtml);
      const caretBefore = caretBeforeEditRef.current;
      caretBeforeEditRef.current = null;
      if (cur.html === h.present.html) {
        // Текст не менялся — освежаем только позицию курсора текущего шага.
        h.present = cur;
        syncHistoryFlags();
        return;
      }
      pushUndoState(
        h,
        caretBefore != null
          ? { html: h.present.html, caret: caretBefore }
          : h.present,
      );
      h.present = cur;
      h.redo = [];
      syncHistoryFlags();
    },
    [captureHistoryState, syncHistoryFlags],
  );

  // Составная правка (execCommand + доводка полученной разметки) должна дать
  // ОДИН шаг отмены: промежуточное состояние в историю не пишем, финальное
  // фиксирует commitHistoryNow после блока.
  const runWithoutHistory = useCallback((edit: () => void) => {
    const wasSuppressed = suppressHistoryRef.current;
    suppressHistoryRef.current = true;
    try {
      edit();
    } finally {
      suppressHistoryRef.current = wasSuppressed;
    }
  }, []);

  // Применение снимка истории: чистый HTML в редактор, курсор по символьному
  // смещению, синхронная перепагинация. Распорки/разрезы в снимках не хранятся,
  // поэтому «лишние страницы со старым содержимым» после отмены невозможны.
  const applyHistoryState = useCallback(
    (state: THistoryState) => {
      const editor = editorRef.current;
      if (!editor) return;
      suppressHistoryRef.current = true;
      try {
        editor.innerHTML =
          state.html && state.html !== HISTORY_EMPTY_HTML
            ? state.html
            : "<p><br></p>";
        editor.focus();
        if (state.caret != null) {
          restoreCaretCharOffset(editor, {
            offset: state.caret,
            preferNext: false,
          });
        }
        if (paginateEditorRef.current) {
          setPageCount(paginateEditorRef.current());
        }
        setEditorContent(getCleanEditorHtml());
      } finally {
        suppressHistoryRef.current = false;
      }
    },
    [getCleanEditorHtml],
  );

  const undoEdit = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !editor.isContentEditable) return;
    // Правка, не успевшая попасть в историю (незавершённая IME-композиция),
    // добивается отдельным шагом — его и отменим.
    commitHistoryNow();
    const h = historyRef.current;
    const target = popUndoState(h);
    if (!target) return;
    h.redo.push(h.present);
    applyHistoryState(target);
    // present — нормализованная форма применённого снимка (innerHTML может
    // пересериализовать разметку; фиксируем её, чтобы следующая фиксация не
    // увидела фантомное «изменение»).
    h.present = { html: getCleanEditorHtml(), caret: target.caret };
    caretBeforeEditRef.current = null;
    syncHistoryFlags();
  }, [
    commitHistoryNow,
    applyHistoryState,
    getCleanEditorHtml,
    syncHistoryFlags,
  ]);

  const redoEdit = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !editor.isContentEditable) return;
    // Незафиксированные правки — это новая ветка: фиксация сама очистит redo.
    commitHistoryNow();
    const h = historyRef.current;
    const target = h.redo.pop();
    if (!target) return;
    pushUndoState(h, h.present);
    applyHistoryState(target);
    h.present = { html: getCleanEditorHtml(), caret: target.caret };
    caretBeforeEditRef.current = null;
    syncHistoryFlags();
  }, [
    commitHistoryNow,
    applyHistoryState,
    getCleanEditorHtml,
    syncHistoryFlags,
  ]);

  // Полный сброс истории — при загрузке другого содержимого (версия документа,
  // вшивание штампа подписи): отмена не должна «выныривать» в чужую версию.
  const resetHistory = useCallback(() => {
    historyRef.current = createHistoryStack(getCleanEditorHtml());
    caretBeforeEditRef.current = null;
    syncHistoryFlags();
  }, [getCleanEditorHtml, syncHistoryFlags]);

  // Базовое состояние при монтировании.
  useEffect(() => {
    resetHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Каретка «до правки»: keydown в фазе перехвата опережает и React-обработчики
  // клавиш (Tab, Backspace на границе страниц), и правку DOM браузером;
  // beforeinput закрывает ввод без клавиатуры — вставку, drag&drop, диктовку.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const noteCaretBeforeEdit = () => {
      if (suppressHistoryRef.current) return;
      caretBeforeEditRef.current = getCaretCharOffset(editor)?.offset ?? null;
    };
    editor.addEventListener("keydown", noteCaretBeforeEdit, true);
    editor.addEventListener("beforeinput", noteCaretBeforeEdit, true);
    return () => {
      editor.removeEventListener("keydown", noteCaretBeforeEdit, true);
      editor.removeEventListener("beforeinput", noteCaretBeforeEdit, true);
    };
  }, [editorRef]);

  // Перехват отмены из контекстного меню браузера / меню «Правка»: нативный
  // стек не используется, вместо него — наша история. Плюс IME: промежуточные
  // состояния композиции в историю не пишутся (шагами были бы «полусимволы»),
  // готовый результат фиксируется по compositionend.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onBeforeInput = (e: Event) => {
      const inputType = (e as InputEvent).inputType;
      if (inputType === "historyUndo") {
        e.preventDefault();
        undoEdit();
      } else if (inputType === "historyRedo") {
        e.preventDefault();
        redoEdit();
      }
    };
    const onCompositionEnd = () => commitHistoryNow();
    editor.addEventListener("beforeinput", onBeforeInput);
    editor.addEventListener("compositionend", onCompositionEnd);
    return () => {
      editor.removeEventListener("beforeinput", onBeforeInput);
      editor.removeEventListener("compositionend", onCompositionEnd);
    };
  }, [undoEdit, redoEdit, commitHistoryNow]);

  return {
    canUndo,
    canRedo,
    undoEdit,
    redoEdit,
    resetHistory,
    commitHistoryNow,
    runWithoutHistory,
  };
};
