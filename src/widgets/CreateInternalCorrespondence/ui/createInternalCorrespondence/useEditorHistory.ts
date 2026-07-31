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
  // пагинацией) + позиция курсора в символах. Серия набора текста склеивается
  // в один шаг по паузе; дискретные операции (вставка, форматирование, разрыв
  // страницы, слияние) фиксируются сразу.
  type HistoryState = { html: string; caret: number | null };
  const historyRef = useRef<{
    undo: HistoryState[];
    redo: HistoryState[];
    present: HistoryState;
  }>({ undo: [], redo: [], present: { html: "<p></p>", caret: null } });
  const historyTimerRef = useRef<number | null>(null);
  // Во время применения снимка (undo/redo) не фиксируем «изменения» повторно.
  const suppressHistoryRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncHistoryFlags = useCallback(() => {
    setCanUndo(
      historyRef.current.undo.length > 0 || historyTimerRef.current != null,
    );
    setCanRedo(historyRef.current.redo.length > 0);
  }, []);

  // Текущее состояние документа для истории: чистый HTML + курсор в символах.
  const captureHistoryState = useCallback((): HistoryState => {
    const editor = editorRef.current;
    const caret = editor ? (getCaretCharOffset(editor)?.offset ?? null) : null;
    return { html: getCleanEditorHtml(), caret };
  }, [getCleanEditorHtml]);

  // Немедленная фиксация: если документ изменился с прошлого шага — прошлое
  // состояние уходит в стек отмены, redo очищается (новая ветка правок).
  const commitHistoryNow = useCallback(() => {
    if (suppressHistoryRef.current) return;
    if (historyTimerRef.current != null) {
      window.clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
    const h = historyRef.current;
    const cur = captureHistoryState();
    if (cur.html === h.present.html) {
      // Текст не менялся — освежаем только позицию курсора текущего шага.
      h.present = cur;
      syncHistoryFlags();
      return;
    }
    h.undo.push(h.present);
    if (h.undo.length > 200) h.undo.shift();
    h.present = cur;
    h.redo = [];
    syncHistoryFlags();
  }, [captureHistoryState, syncHistoryFlags]);

  // Отложенная фиксация для набора текста: серия нажатий между паузами
  // становится одним шагом истории (как в Word).
  const scheduleHistoryCommit = useCallback(() => {
    if (suppressHistoryRef.current) return;
    if (historyTimerRef.current != null) {
      window.clearTimeout(historyTimerRef.current);
    }
    historyTimerRef.current = window.setTimeout(() => {
      historyTimerRef.current = null;
      commitHistoryNow();
    }, 500);
    syncHistoryFlags();
  }, [commitHistoryNow, syncHistoryFlags]);

  // Применение снимка истории: чистый HTML в редактор, курсор по символьному
  // смещению, синхронная перепагинация. Распорки/разрезы в снимках не хранятся,
  // поэтому «лишние страницы со старым содержимым» после отмены невозможны.
  const applyHistoryState = useCallback(
    (state: HistoryState) => {
      const editor = editorRef.current;
      if (!editor) return;
      suppressHistoryRef.current = true;
      try {
        editor.innerHTML =
          state.html && state.html !== "<p></p>"
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
    // Незафиксированный набор добиваем в отдельный шаг — его и отменим.
    commitHistoryNow();
    const h = historyRef.current;
    if (!h.undo.length) return;
    const target = h.undo.pop()!;
    h.redo.push(h.present);
    applyHistoryState(target);
    // present — нормализованная форма применённого снимка (innerHTML может
    // пересериализовать разметку; фиксируем её, чтобы следующая фиксация не
    // увидела фантомное «изменение»).
    h.present = { html: getCleanEditorHtml(), caret: target.caret };
    syncHistoryFlags();
  }, [commitHistoryNow, applyHistoryState, getCleanEditorHtml, syncHistoryFlags]);

  const redoEdit = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !editor.isContentEditable) return;
    // Незафиксированные правки — это новая ветка: фиксация сама очистит redo.
    commitHistoryNow();
    const h = historyRef.current;
    if (!h.redo.length) return;
    const target = h.redo.pop()!;
    h.undo.push(h.present);
    applyHistoryState(target);
    h.present = { html: getCleanEditorHtml(), caret: target.caret };
    syncHistoryFlags();
  }, [commitHistoryNow, applyHistoryState, getCleanEditorHtml, syncHistoryFlags]);

  // Полный сброс истории — при загрузке другого содержимого (версия документа,
  // вшивание штампа подписи): отмена не должна «выныривать» в чужую версию.
  const resetHistory = useCallback(() => {
    if (historyTimerRef.current != null) {
      window.clearTimeout(historyTimerRef.current);
      historyTimerRef.current = null;
    }
    historyRef.current = {
      undo: [],
      redo: [],
      present: { html: getCleanEditorHtml(), caret: null },
    };
    syncHistoryFlags();
  }, [getCleanEditorHtml, syncHistoryFlags]);

  // Базовое состояние при монтировании + очистка отложенной фиксации.
  useEffect(() => {
    resetHistory();
    return () => {
      if (historyTimerRef.current != null) {
        window.clearTimeout(historyTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Перехват отмены из контекстного меню браузера / меню «Правка»: нативный
  // стек не используется, вместо него — наша история.
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
    editor.addEventListener("beforeinput", onBeforeInput);
    return () => editor.removeEventListener("beforeinput", onBeforeInput);
  }, [undoEdit, redoEdit]);

  return {
    canUndo,
    canRedo,
    undoEdit,
    redoEdit,
    resetHistory,
    commitHistoryNow,
    scheduleHistoryCommit,
  };
};
