import React, { useCallback, useState } from "react";

import { sanitizeWordHtml } from "../../lib/utils";
import {
  analyzeDocxFormatting,
  mammothToEditorHtml,
  paragraphFmtKey,
} from "./docxImport";

interface IParams {
  buildFragmentFromHtml: (html: string) => DocumentFragment;
  insertFragmentAtCaret: (fragment: DocumentFragment) => void;
}

export const useWordImport = ({
  buildFragmentFromHtml,
  insertFragmentAtCaret,
}: IParams) => {
  // Идёт конвертация загруженного .docx (mammoth) — блокируем кнопку импорта
  const [importingWord, setImportingWord] = useState(false);
  // Над редактором тащат файл — показываем подсказку-оверлей для импорта
  const [isDraggingWord, setIsDraggingWord] = useState(false);

  // Импорт .docx: mammoth конвертирует документ Word в семантический HTML
  // (заголовки, списки, таблицы, картинки). transformDocument + styleMap
  // дополнительно сохраняют выравнивание абзацев и разрывы страниц, затем
  // mammothToEditorHtml/sanitizeWordHtml приводят всё к формату холста.
  // Общее ядро импорта — используется и кнопкой, и перетаскиванием файла.
  const importWordFile = useCallback(
    async (file: File) => {
      if (!/\.docx?$/i.test(file.name)) {
        alert("Поддерживаются только файлы Word (.docx).");
        return;
      }
      if (importingWord) return;

      setImportingWord(true);
      try {
        const mod = await import("mammoth");
        const mammoth = (mod as any).default ?? mod;
        const arrayBuffer = await file.arrayBuffer();

        // Анализируем .docx: форматирование по умолчанию + все нужные ключи
        // абзацев (выравнивание/красная строка/левый отступ). По ним строим
        // styleMap и помечаем абзацы в transformDocument тем же ключом.
        const { defaults, fmtKeys } = await analyzeDocxFormatting(arrayBuffer);

        const transformDocument = mammoth.transforms.paragraph((p: any) => {
          if (/heading|заголов/i.test(`${p.styleName || ""} ${p.styleId || ""}`))
            return p; // заголовки оставляем семантическими (<h1>…<h6>)
          const key = paragraphFmtKey(
            p.alignment,
            p.indent?.firstLine,
            p.indent?.start,
            defaults,
          );
          if (!key) return p;
          return { ...p, styleId: key, styleName: key };
        });

        const styleMap = [
          ...fmtKeys.map((k) => `p[style-name='${k}'] => p.${k}:fresh`),
          "br[type='page'] => hr.docx-page-break:fresh",
          // mammoth по умолчанию сохраняет только жирный/курсив (=> strong/em),
          // а подчёркивание и зачёркивание молча отбрасывает. Возвращаем их —
          // иначе при импорте Word терялись эти начертания.
          "u => u",
          "strike => s",
        ];

        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            transformDocument,
            styleMap,
            // сохраняем пустые абзацы — это пустые строки-отступы из Word
            ignoreEmptyParagraphs: false,
          },
        );

        const html = sanitizeWordHtml(mammothToEditorHtml(result.value || ""));
        if (!html.trim()) {
          alert("Не удалось извлечь содержимое из документа.");
          return;
        }
        insertFragmentAtCaret(buildFragmentFromHtml(html));
      } catch (err) {
        console.error("Ошибка импорта Word-файла:", err);
        alert("Не удалось импортировать документ Word.");
      } finally {
        setImportingWord(false);
      }
    },
    [
      importingWord,
      buildFragmentFromHtml,
      insertFragmentAtCaret,
      mammothToEditorHtml,
    ],
  );

  // Выбор файла через кнопку «Импорт Word».
  const handleImportWord = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) importWordFile(file);
    },
    [importWordFile],
  );

  // Перетаскивание .docx прямо в редактор — альтернатива кнопке импорта.
  // (обработчики навешиваются в JSX только в режиме редактирования)
  const handleEditorDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const files = Array.from(e.dataTransfer?.files || []);
      if (!files.length) return; // перетаскивание текста — не мешаем
      // Любой файл перехватываем, чтобы браузер не открыл/не вставил его сам.
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingWord(false);
      const file = files.find((f) => /\.docx?$/i.test(f.name));
      if (file) importWordFile(file);
      else alert("Поддерживаются только файлы Word (.docx).");
    },
    [importWordFile],
  );

  const handleEditorDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const hasFiles = Array.from(e.dataTransfer?.types || []).includes(
        "Files",
      );
      if (!hasFiles) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      if (!isDraggingWord) setIsDraggingWord(true);
    },
    [isDraggingWord],
  );

  const handleEditorDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      // Срабатывает только при выходе за пределы контейнера, а не при переходе
      // между его дочерними элементами.
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setIsDraggingWord(false);
    },
    [],
  );

  // Нативный обработчик вставки: гарантированно отменяет стандартную вставку

  return {
    importingWord,
    isDraggingWord,
    handleImportWord,
    handleEditorDrop,
    handleEditorDragOver,
    handleEditorDragLeave,
  };
};
