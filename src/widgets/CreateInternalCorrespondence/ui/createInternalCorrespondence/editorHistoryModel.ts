// Шаг истории редактора = одно действие пользователя (символ, пробел,
// табуляция, удаление, вставка), поэтому шагов нужно на порядок больше, чем при
// склейке набора по паузам. Второй предел — суммарный размер снимков: у
// большого импортированного документа тысяча копий HTML съела бы сотни
// мегабайт, поэтому старые шаги вытесняются и по объёму, а не только по числу.
const HISTORY_MAX_STEPS = 1000;
const HISTORY_MAX_CHARS = 8_000_000;

/** Пустой документ в терминах истории (снимки хранят ЧИСТЫЙ HTML). */
export const HISTORY_EMPTY_HTML = "<p></p>";

/** Снимок документа: чистый HTML + позиция каретки в символах. */
export type THistoryState = { html: string; caret: number | null };

export type THistoryStack = {
  undo: THistoryState[];
  redo: THistoryState[];
  present: THistoryState;
  /** Суммарная длина HTML в стеке отмены — для вытеснения по объёму. */
  undoChars: number;
};

export const createHistoryStack = (html: string): THistoryStack => ({
  undo: [],
  redo: [],
  present: { html, caret: null },
  undoChars: 0,
});

/** Добавляет шаг в стек отмены, вытесняя самые старые по числу и по объёму. */
export const pushUndoState = (h: THistoryStack, state: THistoryState) => {
  h.undo.push(state);
  h.undoChars += state.html.length;
  while (
    h.undo.length > HISTORY_MAX_STEPS ||
    (h.undoChars > HISTORY_MAX_CHARS && h.undo.length > 1)
  ) {
    const dropped = h.undo.shift();
    if (!dropped) break;
    h.undoChars -= dropped.html.length;
  }
};

/** Снимает последний шаг отмены (null — стек пуст). */
export const popUndoState = (h: THistoryStack): THistoryState | null => {
  const state = h.undo.pop();
  if (!state) return null;
  h.undoChars -= state.html.length;
  return state;
};
