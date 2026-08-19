import { EDITOR_BASE_FONT_SIZE } from "../../lib/constants";

import type {
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  RefObject,
} from "react";

interface IProps {
  editorRef: RefObject<HTMLDivElement | null>;
  isReadOnly: boolean;
  contentHeight: number;
  onInput: (e?: FormEvent<HTMLDivElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  onClick: (e: MouseEvent) => void;
  onMouseDown: (e: MouseEvent) => void;
}

// Отступы абзаца по умолчанию гасим классом `[&_p]:my-0` БЕЗ `!important`:
// интервалы «перед/после» из диалога «Абзац» (и из импортированного Word-файла)
// приходят inline-стилем, а важность класса перебила бы их.
export const EditorSurface = ({
  editorRef,
  isReadOnly,
  contentHeight,
  onInput,
  onKeyDown,
  onClick,
  onMouseDown,
}: IProps) => (
  <div
    ref={editorRef}
    contentEditable={!isReadOnly}
    suppressContentEditableWarning
    data-placeholder="Начните вводить текст письма..."
    onInput={onInput}
    onKeyDown={onKeyDown}
    onClick={onClick}
    onMouseDown={onMouseDown}
    style={{
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
    }}
    className="doc-preview-content focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-300 [&:empty]:before:italic [&:empty]:before:pointer-events-none [&_*]:max-w-full [&_*]:!whitespace-pre-wrap [&_*]:break-words [&_img]:h-auto [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_td]:break-words [&_td]:align-top [&_td]:border [&_td]:border-slate-300 [&_td]:px-2 [&_td]:py-1 [&_th]:break-words [&_th]:align-top [&_th]:border [&_th]:border-slate-300 [&_th]:px-2 [&_th]:py-1 [&_pre]:whitespace-pre-wrap [&_p]:my-0 [&_[data-page-spacer]]:select-none [&_[data-page-spacer]]:cursor-default [&_[data-page-break]]:select-none [&_[data-page-break]]:pointer-events-none [&_[data-signature-stamp]]:select-none [&_[data-signature-stamp]]:!cursor-zoom-in"
  />
);
