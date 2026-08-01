import type { KeyboardEvent } from "react";

/**
 * Общий контекст обработчиков клавиш редактора. Каждый обработчик возвращает
 * true, если событие обработано полностью и остальные проверять не нужно.
 */
export interface IEditorKeyDeps {
  /** Синхронная перепагинация + синхронизация стейта и истории после правки DOM. */
  syncEditorAfterDomEdit: () => void;
  /** Фиксация незакоммиченного набора отдельным шагом истории. */
  commitHistoryNow: () => void;
  execCmd: (command: string, value?: string) => void;
}

export type TEditorKeyEvent = KeyboardEvent<HTMLDivElement>;

export type TEditorKeyHandler = (
  e: TEditorKeyEvent,
  editor: HTMLDivElement | null,
  deps: IEditorKeyDeps,
) => boolean;
