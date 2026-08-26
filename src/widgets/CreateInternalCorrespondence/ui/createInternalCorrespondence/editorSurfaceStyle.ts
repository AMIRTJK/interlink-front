import type { CSSProperties } from "react";

import { EDITOR_BASE_FONT_SIZE } from "../../lib/constants";

// Оформление колонки набора. Живёт отдельно от компонента: ту же типографику
// слой-в-слой повторяет подсветка авторов (AuthorshipOverlay), и малейшее
// расхождение развело бы подложки с буквами. Держать это в EditorSurface.tsx
// нельзя — файл компонента с посторонними экспортами перестаёт быть границей
// Fast Refresh, и дев-сервер отдаёт устаревший модуль.

// Отступы абзаца по умолчанию гасим классом `[&_p]:my-0` БЕЗ `!important`:
// интервалы «перед/после» из диалога «Абзац» (и из импортированного Word-файла)
// приходят inline-стилем, а важность класса перебила бы их.
export const EDITOR_SURFACE_CLASS =
  "doc-preview-content focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-300 [&:empty]:before:italic [&:empty]:before:pointer-events-none [&_*]:max-w-full [&_*]:!whitespace-pre-wrap [&_*]:break-words [&_img]:h-auto [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_td]:break-words [&_td]:align-top [&_td]:border [&_td]:border-slate-300 [&_td]:px-2 [&_td]:py-1 [&_th]:break-words [&_th]:align-top [&_th]:border [&_th]:border-slate-300 [&_th]:px-2 [&_th]:py-1 [&_pre]:whitespace-pre-wrap [&_p]:my-0 [&_[data-page-spacer]]:select-none [&_[data-page-spacer]]:cursor-default [&_[data-page-break]]:select-none [&_[data-page-break]]:pointer-events-none [&_[data-signature-stamp]]:select-none [&_[data-signature-stamp]]:!cursor-zoom-in";

export const editorSurfaceStyle = (contentHeight: number): CSSProperties => ({
  position: "relative",
  zIndex: 1,
  outline: "none",
  width: "100%",
  maxWidth: "100%",
  minHeight: contentHeight,
  fontFamily: "Times New Roman, serif",
  fontSize: `${EDITOR_BASE_FONT_SIZE}px`,
  lineHeight: 1.8,
  color: "#1e293b",
  whiteSpace: "pre-wrap",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  overflow: "visible",
});
