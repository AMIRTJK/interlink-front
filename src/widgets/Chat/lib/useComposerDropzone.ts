import { useCallback, useRef, useState, type DragEvent } from "react";

/**
 * Перетаскивание вложений в поле ввода.
 *
 * `dragenter`/`dragleave` приходят на каждый вложенный узел, поэтому события
 * считаем: подсветку гасим только когда указатель ушёл из зоны целиком, а не
 * перешёл с кнопки на текстовое поле.
 */
export const useComposerDropzone = (onDropFiles?: (files: File[]) => void) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const depth = useRef(0);

  const isFileDrag = (event: DragEvent) =>
    Array.from(event.dataTransfer.types || []).includes("Files");

  const handleDragEnter = useCallback((event: DragEvent) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    depth.current += 1;
    setIsDraggingOver(true);
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => {
    if (!isFileDrag(event)) return;
    // Без preventDefault браузер откроет файл вместо того, чтобы отдать его нам.
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    if (!isFileDrag(event)) return;
    depth.current = Math.max(0, depth.current - 1);
    if (depth.current === 0) setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent) => {
      if (!isFileDrag(event)) return;
      event.preventDefault();
      depth.current = 0;
      setIsDraggingOver(false);

      const files = Array.from(event.dataTransfer.files || []);
      if (files.length) onDropFiles?.(files);
    },
    [onDropFiles],
  );

  return {
    isDraggingOver,
    dropHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};
