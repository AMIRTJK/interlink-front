import { useCallback, useEffect, type RefObject } from "react";

import { sanitizeWordHtml } from "../../lib/utils";
import { cleanEditorArtifacts, htmlToPlainText } from "./editorCaret";
import {
  buildFragmentFromHtml,
  buildInlineFragmentFromHtml,
} from "./editorFragments";

interface IParams {
  editorRef: RefObject<HTMLDivElement | null>;
  insertFragmentAtCaret: (fragment: DocumentFragment) => void;
  syncEditorAfterDomEdit: () => void;
  commitHistoryNow: () => void;
}

/**
 * Буфер обмена редактора: вставка с очисткой Word-разметки и копирование/
 * вырезание очищенного фрагмента. Оба обработчика нативные — только так можно
 * гарантированно отменить поведение браузера по умолчанию.
 */
export const useEditorClipboard = ({
  editorRef,
  insertFragmentAtCaret,
  syncEditorAfterDomEdit,
  commitHistoryNow,
}: IParams) => {
  // Очистка HTML при вставке из Word / PDF / других источников: sanitizeWordHtml
  // убирает служебную разметку Office, переводит размеры pt → px (тот же 96 DPI,
  // что и у А4-холста) и нормализует пробелы — поэтому форматирование совпадает
  // с исходным документом, а текст не выходит за границы листа.
  const handleEditorPaste = useCallback(
    (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const editor = editorRef.current;
      if (!editor || !e.clipboardData) return;

      const html = e.clipboardData.getData("text/html");
      const text = e.clipboardData.getData("text/plain");
      const isMultiline = /\r?\n/.test(text.trim());

      const htmlHasText = !!html && !!html.replace(/<[^>]*>/g, "").trim();

      let fragment: DocumentFragment;
      if (html && isMultiline) {
        // Многострочный форматированный контент (документ из Word) — сохраняем
        // структуру и оформление как есть.
        fragment = buildFragmentFromHtml(sanitizeWordHtml(html));
        fragment = buildFragmentFromHtml(sanitizeWordHtml(html));
      } else if (htmlHasText) {
        fragment = buildInlineFragmentFromHtml(sanitizeWordHtml(html));
      } else if (text) {
        fragment = document.createDocumentFragment();
        if (!isMultiline) {
          fragment.appendChild(document.createTextNode(text));
        } else {
          const paragraphs = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
          paragraphs.forEach((para) => {
            const block = document.createElement("p");
            const lines = para.split("\n");
            lines.forEach((line, idx) => {
              block.appendChild(document.createTextNode(line));
              if (idx < lines.length - 1)
                block.appendChild(document.createElement("br"));
            });
            if (!block.textContent)
              block.appendChild(document.createElement("br"));
            fragment.appendChild(block);
          });
        }
      } else {
        return;
      }

      insertFragmentAtCaret(fragment);
    },
    [editorRef, insertFragmentAtCaret],
  );

  // Нативный обработчик вставки: гарантированно отменяет стандартную вставку
  // браузера (иначе контент дублировался — нативная + ручная вставка).
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.addEventListener("paste", handleEditorPaste);
    return () => editor.removeEventListener("paste", handleEditorPaste);
  }, [editorRef, handleEditorPaste]);

  // Копирование/вырезание: в буфер кладём ОЧИЩЕННЫЙ фрагмент — без служебной
  // разметки пагинации (распорки/разрезы) и без zero-height блоков. Иначе
  // нативный copy выносил во внешние редакторы/Word внутренние артефакты и
  // «рваное» форматирование. text/plain формируем с переносами абзацев, чтобы
  // вставка в обычные поля не «слипалась». Для cut дополнительно удаляем
  // выделение через собственную логику с фиксацией истории.
  const handleEditorCopyCut = useCallback(
    (e: ClipboardEvent, isCut: boolean) => {
      const editor = editorRef.current;
      const sel = window.getSelection();
      if (!editor || !e.clipboardData || !sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (range.collapsed || !editor.contains(range.commonAncestorContainer))
        return;
      e.preventDefault();
      const holder = document.createElement("div");
      holder.appendChild(range.cloneContents());
      const cleanHtml = cleanEditorArtifacts(holder.innerHTML);
      e.clipboardData.setData("text/html", cleanHtml);
      e.clipboardData.setData("text/plain", htmlToPlainText(cleanHtml));
      if (isCut && editor.isContentEditable) {
        commitHistoryNow();
        range.deleteContents();
        syncEditorAfterDomEdit();
      }
    },
    [editorRef, commitHistoryNow, syncEditorAfterDomEdit],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const onCopy = (e: ClipboardEvent) => handleEditorCopyCut(e, false);
    const onCut = (e: ClipboardEvent) => handleEditorCopyCut(e, true);
    editor.addEventListener("copy", onCopy);
    editor.addEventListener("cut", onCut);
    return () => {
      editor.removeEventListener("copy", onCopy);
      editor.removeEventListener("cut", onCut);
    };
  }, [editorRef, handleEditorCopyCut]);
};
