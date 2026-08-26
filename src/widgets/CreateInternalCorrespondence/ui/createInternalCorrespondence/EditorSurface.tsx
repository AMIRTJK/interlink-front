import {
  EDITOR_SURFACE_CLASS,
  editorSurfaceStyle,
} from "./editorSurfaceStyle";

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
    style={editorSurfaceStyle(contentHeight)}
    className={EDITOR_SURFACE_CLASS}
  />
);
