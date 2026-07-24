import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Send,
  // Pin,
  Search,
  Plus,
  // ChevronRight,
  // Calendar,
  User,
  Clock,
  Download,
  Trash2,
  X,
  Paperclip,
  Shield,
  Check,
  UserPlus,
  // FileBadge,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  FileType,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Minus,
  Highlighter,
  Flag,
  Eye,
  Monitor,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Save,
  Printer,
} from "lucide-react";
import { useGetQuery, useMutationQuery, buildFormData, toast, tokenControl } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { CORRESPONDENCE_INVALIDATE_KEYS } from "@shared/config";
import { If } from "@shared/ui";
import { message } from "antd";
import { ConfirmationModal } from "./ConfirmationModal";
import { RecipientSelectModal } from "./RecipientSelectModal";
import { DeclineReasonModal } from "./DeclineReasonModal";
import { CancelSignatureModal } from "./CancelSignatureModal";
import type {
  // Status,
  ImportanceLevel,
  PageOrientation,
  // RegistryItem,
  RecipientOption,
  AttachedFile,
  Approver,
  FinalSigner,
  MetaOption,
} from "../types";
import {
  LETTER_TYPE_OPTIONS,
  LETTER_TYPE_DESC,
  IMPORTANCE_OPTIONS,
  IMPORTANCE_DOT,
  // RECIPIENT_OPTIONS,
  FONT_SIZES,
  ATTACHMENT_ACCEPT,
  ATTACHMENT_EXTENSIONS,
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE_MB,
  // INBOX_DOC_TYPES,
  // INBOX_DOC_TYPE_STYLE,
  // MOCK_CONTENT_LINES,
  // OUTBOX_STATUS_LABEL,
  // OUTBOX_STATUS_STYLE,
} from "../lib/constants";
import {
  cn,
  generateQRMatrix,
  sanitizeWordHtml,
  buildDSStampSvg,
  dsStampHeightForWidth,
  formatFileSize,
  mapServerAttachment,
  downloadAttachment,
  createApiFileFromAttachedFile,
  CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE,
} from "../lib/utils";
import { FilePreviewModal } from "@features/Profile";

// Ширина штампа ЭЦП на листе А4 по умолчанию (≈47% ширины полосы) и высота,
// рассчитанная по пропорциям макета. Один источник правды для плейсхолдера,
// вшитой картинки и границ перетаскивания.
const DS_STAMP_DEFAULT_WIDTH = 377;
const DS_STAMP_DEFAULT_HEIGHT = dsStampHeightForWidth(DS_STAMP_DEFAULT_WIDTH);
// Границы масштабирования штампа ЭЦП при размещении. Высота всегда выводится из
// ширины по пропорциям макета (dsStampHeightForWidth), так что достаточно
// ограничить только ширину. Дефолт (377) остаётся внутри диапазона — размер «по
// умолчанию» не меняется.
const DS_STAMP_MIN_WIDTH = 160;
const DS_STAMP_MAX_WIDTH = 760;
import { PreviewModal } from "./PreviewModal";
import { TBtn } from "./TBtn";
import { DSStamp } from "./DSStamp";
import { OriginalLetterPanel } from "./OriginalLetterPanel";
import { RelatedDocsAccordion } from "./RelatedDocsBlock";
import { OriginalLetterCanvas } from "./OriginalLetterCanvas";
import {
  paginateHtml,
  truncateToChars,
  dropChars,
  brAtCharBoundary,
  removeLeadingBr,
  type StampInfo,
} from "../../InternalCorrespondenceIncomingView/lib";
import { ApproversPanel } from "./ApproversPanel";
import { SignerPanel } from "./SignerPanel";
import { IncomingLettersPanel } from "./IncomingLettersPanel";
import { VersionsPanel } from "./VersionsPanel";
import { AttachmentsPanel } from "./AttachmentsPanel";

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

// Генерация QR-кода в виде HTML-строки, идентичного компоненту <QRCodeSVG />,
// чтобы печать ЭЦП в редакторе совпадала с блоком "Подписывающий".
function buildStampQRSvg(value: string, size = 52) {
  const GRID = 21;
  const matrix = generateQRMatrix(value, GRID);
  const cellSize = size / GRID;
  let rects = "";
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (matrix[row][col]) {
        rects += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="#1e3a8a"/>`;
      }
    }
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;flex-shrink:0;"><rect width="${size}" height="${size}" fill="white"/>${rects}</svg>`;
}

// ===== Постраничная разбивка редактора =====
const SPACER_ATTR = "data-page-spacer"; // невидимая распорка на границе страниц
const AUTOSPLIT_ATTR = "data-page-split"; // части одного блока, разрезанного по высоте
const PAGE_BREAK_ATTR = "data-page-break"; // ручной разрыв страницы (кнопка «Новая страница»)
const STAMP_ATTR = "data-signature-stamp"; // печать ЭЦП (вне потока, не трогаем)

const EDITOR_BLOCK_TAGS = new Set([
  "DIV",
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "UL",
  "OL",
  "LI",
  "TABLE",
  "BLOCKQUOTE",
  "PRE",
  "FIGURE",
  "HR",
  "SECTION",
  "ARTICLE",
]);
const EDITOR_ATOMIC_TAGS = new Set([
  "TABLE",
  "IMG",
  "FIGURE",
  "SVG",
  "VIDEO",
  "CANVAS",
]);
// Блоки, которые можно делить на «до/после курсора» при ручном разрыве страницы
const PAGE_SPLITTABLE_TAGS = new Set([
  "DIV",
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "PRE",
]);

let splitGroupSeq = 0;

const isSpacerNode = (n: Node | null): n is HTMLElement =>
  !!n &&
  n.nodeType === Node.ELEMENT_NODE &&
  (n as HTMLElement).hasAttribute(SPACER_ATTR);

const isPageBreakNode = (n: Node | null): n is HTMLElement =>
  !!n &&
  n.nodeType === Node.ELEMENT_NODE &&
  (n as HTMLElement).hasAttribute(PAGE_BREAK_ATTR);

const isStampNode = (n: Node | null): boolean =>
  !!n &&
  n.nodeType === Node.ELEMENT_NODE &&
  (n as HTMLElement).hasAttribute(STAMP_ATTR);

// CSS-пикселей в сантиметре при 96 dpi (A4 794px = 21см). Константа физическая,
// от ориентации не зависит.
const PX_PER_CM = 96 / 2.54;

// Горизонтальная линейка над листом: сантиметровые деления с подписями, поля
// страницы затенены, границы полей — синие. Ширину и поля берём из геометрии
// листа, поэтому линейка точно совпадает с колонкой набора. Sticky — остаётся
// вверху вьюпорта при вертикальной прокрутке (как в Word).
const RULER_MIN_MARGIN = 16; // минимальное поле, px
const RULER_MIN_CONTENT = 160; // минимальная ширина колонки набора, px

const EditorRuler = ({
  pageWidth,
  marginLeft,
  marginRight,
  onChange,
}: {
  pageWidth: number;
  marginLeft: number;
  marginRight: number;
  onChange: (side: "left" | "right", value: number) => void;
}) => {
  const H = 30;
  const baseY = H - 1;
  const contentStart = marginLeft;
  const contentEnd = pageWidth - marginRight;

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<null | "left" | "right">(null);

  // Перетаскивание маркеров полей: слушатели на window, чтобы тянуть можно было
  // и за пределами линейки. Значение зажимаем (минимальное поле и минимальная
  // ширина колонки набора) и прокидываем наверх — там пересчитается раскладка и
  // пагинация.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const side = dragRef.current;
      const box = containerRef.current;
      if (!side || !box) return;
      const x = e.clientX - box.getBoundingClientRect().left;
      if (side === "left") {
        const max = pageWidth - marginRight - RULER_MIN_CONTENT;
        onChange("left", Math.round(Math.min(Math.max(x, RULER_MIN_MARGIN), max)));
      } else {
        const max = pageWidth - marginLeft - RULER_MIN_CONTENT;
        onChange(
          "right",
          Math.round(Math.min(Math.max(pageWidth - x, RULER_MIN_MARGIN), max)),
        );
      }
    };
    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        document.body.style.cursor = "";
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [pageWidth, marginLeft, marginRight, onChange]);

  const startDrag = (side: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = side;
    document.body.style.cursor = "ew-resize";
  };

  const majors: { x: number; label: number }[] = [];
  const minors: number[] = [];
  const stepsLeft = Math.floor(contentStart / PX_PER_CM);
  const stepsRight = Math.ceil((pageWidth - contentStart) / PX_PER_CM);
  for (let cm = -stepsLeft; cm <= stepsRight; cm++) {
    const x = Math.round(contentStart + cm * PX_PER_CM) + 0.5;
    if (x >= 0.5 && x <= pageWidth - 0.5) majors.push({ x, label: cm });
    const half = Math.round(contentStart + (cm + 0.5) * PX_PER_CM) + 0.5;
    if (half >= 0.5 && half <= pageWidth - 0.5) minors.push(half);
  }

  const handleStyle = (x: number): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: x - 6,
    width: 12,
    height: H,
    cursor: "ew-resize",
    zIndex: 3,
  });
  const gripStyle: React.CSSProperties = {
    position: "absolute",
    left: 4,
    top: 0,
    width: 4,
    height: H,
    background: "#3b82f6",
    borderRadius: 2,
    boxShadow: "0 1px 2px rgba(15,23,42,0.35)",
  };

  return (
    <div
      ref={containerRef}
      className="select-none"
      style={{
        position: "sticky",
        top: 8,
        zIndex: 20,
        width: pageWidth,
        height: H,
        marginBottom: 12,
        background: "#fff",
        border: "1px solid rgba(148,163,184,0.35)",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      <svg width={pageWidth} height={H} style={{ display: "block" }}>
        {/* Поля страницы — затенённые зоны слева/справа */}
        <rect x={0} y={0} width={contentStart} height={H} fill="rgba(148,163,184,0.16)" />
        <rect
          x={contentEnd}
          y={0}
          width={Math.max(0, pageWidth - contentEnd)}
          height={H}
          fill="rgba(148,163,184,0.16)"
        />
        {/* Мелкие деления (полсантиметра) */}
        {minors.map((x, i) => (
          <line key={`mn${i}`} x1={x} y1={baseY} x2={x} y2={baseY - 4} stroke="rgba(100,116,139,0.55)" />
        ))}
        {/* Крупные деления и подписи (см) */}
        {majors.map(({ x, label }, i) => (
          <g key={`mj${i}`}>
            <line x1={x} y1={baseY} x2={x} y2={baseY - 8} stroke="rgba(71,85,105,0.9)" />
            {label > 0 && (
              <text x={x + 2} y={11} fontSize={8} fill="#64748b" fontFamily="system-ui, sans-serif">
                {label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Перетаскиваемые маркеры полей (двойной клик — сброс к 80px) */}
      <div
        onMouseDown={startDrag("left")}
        onDoubleClick={() => onChange("left", 80)}
        title="Левое поле — потяните, чтобы сузить/расширить область текста (двойной клик — сброс)"
        style={handleStyle(contentStart)}
      >
        <div style={gripStyle} />
      </div>
      <div
        onMouseDown={startDrag("right")}
        onDoubleClick={() => onChange("right", 80)}
        title="Правое поле — потяните, чтобы сузить/расширить область текста (двойной клик — сброс)"
        style={handleStyle(contentEnd)}
      >
        <div style={gripStyle} />
      </div>
    </div>
  );
};

// Верхнеуровневый блок редактора, содержащий узел
const topLevelBlockOf = (
  editor: HTMLElement,
  node: Node | null,
): HTMLElement | null => {
  let n: Node | null = node;
  while (n && n.parentNode !== editor) n = n.parentNode;
  return n && n.nodeType === Node.ELEMENT_NODE ? (n as HTMLElement) : null;
};

// Соседний РЕАЛЬНЫЙ блок за границей страницы: идём по сиблингам, пропуская
// распорки/разрывы/печати ЭЦП/пустой текст. Возвращаем блок, ТОЛЬКО если по пути
// пересекли распорку или разрыв страницы (иначе граница страницы ни при чём и
// коррекция каретки не нужна — дефолт браузера справится сам).
const blockAcrossPageBoundary = (
  block: HTMLElement,
  dir: "next" | "prev",
): HTMLElement | null => {
  const step = (n: ChildNode | null) =>
    dir === "next" ? n?.nextSibling ?? null : n?.previousSibling ?? null;
  let n: ChildNode | null = step(block);
  let crossed = false;
  while (n) {
    if (isSpacerNode(n) || isPageBreakNode(n)) {
      crossed = true;
      n = step(n);
      continue;
    }
    if (
      isStampNode(n) ||
      (n.nodeType === Node.TEXT_NODE && !(n.textContent || "").trim())
    ) {
      n = step(n);
      continue;
    }
    break;
  }
  if (!crossed || !n || n.nodeType !== Node.ELEMENT_NODE) return null;
  return n as HTMLElement;
};

// Есть ли в диапазоне видимое содержимое (текст / br / атомарные элементы)
const rangeHasContent = (r: Range): boolean => {
  if (r.toString().length > 0) return true;
  const frag = r.cloneContents();
  return !!frag.querySelector("br, img, table, figure, video, canvas, svg");
};

// Каретка стоит в самом начале блока (перед ней нет видимого содержимого)
const caretAtBlockStart = (block: HTMLElement, range: Range): boolean => {
  const pre = range.cloneRange();
  pre.selectNodeContents(block);
  pre.setEnd(range.startContainer, range.startOffset);
  return !rangeHasContent(pre);
};

// Каретка в конце блока: после неё нет содержимого, кроме <br>-плейсхолдера
const caretAtBlockEnd = (block: HTMLElement, range: Range): boolean => {
  const post = range.cloneRange();
  post.selectNodeContents(block);
  post.setStart(range.endContainer, range.endOffset);
  if (post.toString().length > 0) return false;
  const frag = post.cloneContents();
  if (frag.querySelector("img, table, figure, video, canvas, svg"))
    return false;
  return frag.querySelectorAll("br").length <= 1;
};

// Граница слова для гранулярной отмены (undo по словам, как в Word): пробелы,
// табуляция, неразрывный пробел и пунктуация завершают «слово» → отдельный шаг
// истории. Ввод такого символа фиксирует набранное слово в стек отмены.
const WORD_BOUNDARY_RE = /[\s.,;:!?…()[\]{}"'«»„“”‚‘’—–\-/\\|]/;

// Шаг табуляции/красной строки ≈ позиция табуляции Word (1.27 см).
const TAB_STEP_CM = 1.27;
const NBSP = " ";

const isTabSpacer = (n: Node | null): n is HTMLElement =>
  !!n &&
  n.nodeType === Node.ELEMENT_NODE &&
  (n as HTMLElement).getAttribute("data-tab") === "1";

// Сколько неразрывных пробелов даёт ширину ≈ одного шага табуляции Word (1.27см)
// при текущем шрифте редактора. Ширину пробела меряем через canvas, без reflow.
let tabMeasureCanvas: HTMLCanvasElement | null = null;
const tabNbspCount = (editor: HTMLElement): number => {
  const TARGET_PX = 48; // 1.27 см при 96 DPI
  try {
    const cs = getComputedStyle(editor);
    if (!tabMeasureCanvas) tabMeasureCanvas = document.createElement("canvas");
    const ctx = tabMeasureCanvas.getContext("2d");
    if (ctx) {
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const w = ctx.measureText(NBSP).width || ctx.measureText(" ").width;
      if (w > 0) return Math.min(40, Math.max(2, Math.round(TARGET_PX / w)));
    }
  } catch {
    /* getComputedStyle/canvas недоступны — берём разумный дефолт */
  }
  return 12;
};

// Табулятор — прогон неразрывных пробелов в помеченном <span>. Почему не \t и не
// inline-block:
//  • \t выравнивается по сетке tab-size — после слова «схлопывался» до пробела;
//  • trailing-\t не подсвечивается при выделении (Ctrl+A «не видел» табуляцию);
//  • у inline-block фикс. ширины каретка залезала внутрь, и ввод переносился на
//    новую строку внутри коробки.
// Неразрывные пробелы лишены этих проблем: одинаковая ширина независимо от
// позиции, всегда подсвечиваются, не переносятся и не меняют высоту строки.
// Атомарность удаления обеспечивают обработчики клавиш (Backspace/Delete/
// Shift+Tab) по атрибуту data-tab.
const makeTabSpacer = (count: number): HTMLElement => {
  const span = document.createElement("span");
  span.setAttribute("data-tab", "1");
  span.textContent = NBSP.repeat(Math.max(1, count));
  return span;
};

// Узел непосредственно слева от свёрнутой каретки (или null).
const nodeBeforeCaret = (range: Range): Node | null => {
  if (!range.collapsed) return null;
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    return startOffset === 0 ? startContainer.previousSibling : null;
  }
  return startOffset > 0 ? startContainer.childNodes[startOffset - 1] : null;
};

// Узел непосредственно справа от свёрнутой каретки (или null).
const nodeAfterCaret = (range: Range): Node | null => {
  if (!range.collapsed) return null;
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.TEXT_NODE) {
    return startOffset === (startContainer as Text).length
      ? startContainer.nextSibling
      : null;
  }
  return startContainer.childNodes[startOffset] ?? null;
};

// Табулятор, который надо удалить целиком при Backspace/Delete: тот, внутри
// которого стоит каретка, либо соседний слева ("prev") / справа ("next").
const tabSpacerToDelete = (
  range: Range,
  dir: "prev" | "next",
): HTMLElement | null => {
  const host =
    range.startContainer.nodeType === Node.ELEMENT_NODE
      ? (range.startContainer as HTMLElement)
      : range.startContainer.parentElement;
  const inside = host?.closest?.("[data-tab]") as HTMLElement | null;
  if (isTabSpacer(inside)) return inside;
  const sib = dir === "prev" ? nodeBeforeCaret(range) : nodeAfterCaret(range);
  return isTabSpacer(sib) ? sib : null;
};

// Удаление табулятора целиком с установкой каретки на его место.
const removeTabSpacer = (
  span: HTMLElement,
  setCaret: (node: Node, offset: number) => void,
) => {
  const parent = span.parentNode as Node;
  const idx = Array.prototype.indexOf.call(parent.childNodes, span);
  span.remove();
  setCaret(parent, idx);
};

// Ближайший <li>, содержащий узел (в пределах редактора). null — вне списка.
const closestLiOf = (
  editor: HTMLElement,
  node: Node | null,
): HTMLElement | null => {
  let n: Node | null =
    node && node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
  while (n && n !== editor) {
    if (n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).tagName === "LI")
      return n as HTMLElement;
    n = n.parentNode;
  }
  return null;
};

// Красная строка (first-line indent) блока в сантиметрах; 0 — если не задана в cm.
const getTextIndentCm = (block: HTMLElement | null): number => {
  const v = block?.style?.textIndent || "";
  const m = /^(-?[\d.]+)cm$/.exec(v.trim());
  return m ? parseFloat(m[1]) : 0;
};

// Удаляет один табулятор слева от свёрнутой каретки. true — если удалил.
const deleteTabBeforeCaret = (range: Range): boolean => {
  if (!range.collapsed) return false;
  const { startContainer, startOffset } = range;
  // а) символ табуляции в тексте (совместимость со старым форматом)
  if (startContainer.nodeType === Node.TEXT_NODE && startOffset > 0) {
    const text = startContainer as Text;
    if (text.data[startOffset - 1] === "\t") {
      text.deleteData(startOffset - 1, 1);
      range.setStart(text, startOffset - 1);
      range.collapse(true);
      return true;
    }
  }
  // б) табулятор-спейсер слева (или тот, внутри которого стоит каретка)
  const spacer = tabSpacerToDelete(range, "prev");
  if (spacer) {
    removeTabSpacer(spacer, (node, offset) => {
      range.setStart(node, offset);
      range.collapse(true);
    });
    return true;
  }
  return false;
};

// Пустые inline-обёртки (<b></b>, <span></span> и т.п.), остающиеся после
// слияния/правок блоков, чистим — иначе каретка «залипает» в невидимом узле,
// а разметка распухает. Узлы с текстом или значимым содержимым (img/br/table)
// не трогаем. Порядок обхода — документный, remove() на уже удалённом узле
// (когда удалили родителя раньше ребёнка) безопасен.
const EMPTY_INLINE_TAGS = new Set([
  "B",
  "I",
  "U",
  "S",
  "STRIKE",
  "EM",
  "STRONG",
  "SPAN",
  "SUB",
  "SUP",
  "FONT",
  "MARK",
  "SMALL",
]);
const normalizeBlock = (el: HTMLElement) => {
  el.querySelectorAll("*").forEach((node) => {
    if (!EMPTY_INLINE_TAGS.has(node.tagName)) return;
    if ((node.textContent || "").length) return;
    if (node.querySelector("img,br,hr,table")) return;
    node.remove();
  });
  el.normalize();
};

// Слияние первого блока следующей страницы с последним блоком предыдущей —
// как при обычном Backspace внутри одной страницы.
const mergePageBlocks = (target: HTMLElement, source: HTMLElement) => {
  if (target.lastChild && target.lastChild.nodeName === "BR") {
    target.removeChild(target.lastChild);
  }
  while (source.firstChild) target.appendChild(source.firstChild);
  source.remove();
  target.normalize();
};

// Слияние блоков через границу страницы с учётом списков и атомарных блоков.
// Возвращает позицию для курсора (точку склейки) или null, если слияние невозможно.
const mergeAcrossBoundary = (
  target: HTMLElement,
  source: HTMLElement,
): { node: Node; offset: number } | null => {
  // Куда вливаем: для списка — в его последний пункт
  let t = target;
  if ((t.tagName === "UL" || t.tagName === "OL") && t.lastElementChild) {
    t = t.lastElementChild as HTMLElement;
  }
  if (EDITOR_ATOMIC_TAGS.has(t.tagName)) return null;

  // Что вливаем: из списка — только первый пункт (остальное остаётся списком)
  let s = source;
  let sourceList: HTMLElement | null = null;
  if (s.tagName === "UL" || s.tagName === "OL") {
    const firstLi = s.firstElementChild as HTMLElement | null;
    if (!firstLi) {
      s.remove();
      return { node: t, offset: t.childNodes.length };
    }
    sourceList = s;
    s = firstLi;
  } else if (EDITOR_ATOMIC_TAGS.has(s.tagName)) {
    return null;
  }

  const junction = (t.textContent || "").length;
  mergePageBlocks(t, s);
  normalizeBlock(t);
  if (sourceList && !sourceList.firstElementChild) sourceList.remove();
  return charPosAt(t, junction);
};

// Снимок позиции курсора: абсолютное смещение в символах + признак того,
// что курсор стоял в начале своего текстового узла. На границе двух блоков
// одно и то же смещение означает и «конец предыдущего», и «начало следующего» —
// без признака курсор «перепрыгивал» в конец текста предыдущей страницы.
type CaretSnapshot = { offset: number; preferNext: boolean } | null;

// Абсолютная позиция курсора в символах внутри редактора
const getCaretCharOffset = (editor: HTMLElement): CaretSnapshot => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode))
    return null;
  const range = sel.getRangeAt(0);
  const pre = range.cloneRange();
  pre.selectNodeContents(editor);
  pre.setEnd(range.endContainer, range.endOffset);
  const preferNext =
    range.endContainer.nodeType === Node.TEXT_NODE && range.endOffset === 0;
  return { offset: pre.toString().length, preferNext };
};

// Восстановление курсора по абсолютной позиции в символах
const restoreCaretCharOffset = (editor: HTMLElement, caret: CaretSnapshot) => {
  if (caret == null) return;
  let remaining = caret.offset;
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null);
  let node: Node | null;
  let last: Node | null = null;
  const place = (n: Node, off: number) => {
    const range = document.createRange();
    range.setStart(n, off);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0;
    if (remaining < len || (remaining === len && !caret.preferNext)) {
      place(node, remaining);
      return;
    }
    remaining -= len;
    last = node;
  }
  // Точная позиция не найдена (preferNext в самом конце документа) —
  // ставим курсор в конец последнего текстового узла.
  if (last) place(last, last.textContent?.length ?? 0);
};

// Позиция (узел, смещение) для абсолютного символьного индекса внутри элемента
const charPosAt = (
  root: HTMLElement,
  k: number,
): { node: Node; offset: number } => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let acc = 0;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const len = node.textContent?.length ?? 0;
    if (acc + len >= k) return { node, offset: k - acc };
    acc += len;
  }
  return { node: root, offset: root.childNodes.length };
};

// Удаление распорки без потери содержимого: браузер при Backspace/Delete на
// границе страниц может слить пользовательский текст внутрь распорки —
// в этом случае возвращаем его в поток обычным блоком.
// Возвращает true, если содержимое пришлось спасать.
const removeSpacerSafely = (n: Element): boolean => {
  if ((n.textContent || "").trim()) {
    const div = document.createElement("p");
    while (n.firstChild) div.appendChild(n.firstChild);
    n.replaceWith(div);
    return true;
  }
  n.remove();
  return false;
};

// «Голый» текст и инлайн-узлы верхнего уровня заворачиваем в блочные <div>.
// Постраничная разбивка (getEditorPages) и печать перебирают только element-
// детей редактора, поэтому неупакованный текстовый узел (например, одиночная
// цифра «3», набранная в пустой редактор) не попадал ни на одну страницу и
// пропадал в предпросмотре и при печати. Пустые пробельные промежутки между
// блоками не трогаем, чтобы не плодить лишние пустые строки. Возвращает true,
// если структура была изменена.
const wrapBareTopLevelNodes = (root: HTMLElement): boolean => {
  let mutated = false;
  let buf: Node[] = [];
  const flush = () => {
    if (!buf.length) return;
    const nodes = buf;
    buf = [];
    const meaningful = nodes.some(
      (n) =>
        n.nodeType === Node.ELEMENT_NODE ||
        (n.nodeType === Node.TEXT_NODE && (n.textContent || "").trim() !== ""),
    );
    if (!meaningful) return;
    const div = document.createElement("p");
    nodes[0].parentNode?.insertBefore(div, nodes[0]);
    nodes.forEach((n) => div.appendChild(n));
    mutated = true;
  };
  Array.from(root.childNodes).forEach((node) => {
    const isBlock =
      node.nodeType === Node.ELEMENT_NODE &&
      EDITOR_BLOCK_TAGS.has((node as HTMLElement).tagName);
    if (isBlock) flush();
    else buf.push(node);
  });
  flush();
  return mutated;
};

// HTML → плоский текст для буфера обмена: блоки дают перевод строки, <br> → \n.
// Нужно для того, чтобы при копировании/вырезании text/plain не «слипался»
// (вставка в plain-поля должна сохранять переносы абзацев, как в Word).
const htmlToPlainText = (html: string): string => {
  const d = document.createElement("div");
  d.innerHTML = html;
  d.querySelectorAll("br").forEach((br) =>
    br.replaceWith(document.createTextNode("\n")),
  );
  const blockSel = "p,div,h1,h2,h3,h4,h5,h6,li,tr,blockquote,pre";
  d.querySelectorAll(blockSel).forEach((b) => {
    if (b.nextSibling) b.appendChild(document.createTextNode("\n"));
  });
  return (d.textContent || "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n");
};

const cleanEditorArtifacts = (html: string): string => {
  const w = document.createElement("div");
  w.innerHTML = html;

  w.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => removeSpacerSafely(n));
  w.querySelectorAll<HTMLElement>("[data-tab]").forEach((s) => {
    if (!s.textContent) s.remove();
  });

  const groups = new Map<string, HTMLElement[]>();
  w.querySelectorAll<HTMLElement>(`[${AUTOSPLIT_ATTR}]`).forEach((el) => {
    // Если этот кусок принадлежит штампу ЭЦП, не трогаем его авторазбивки
    if (el.hasAttribute(STAMP_ATTR) || el.closest(`[${STAMP_ATTR}]`)) return;

    const gid = el.getAttribute(AUTOSPLIT_ATTR) || "";
    const arr = groups.get(gid) || [];
    arr.push(el);
    groups.set(gid, arr);
  });

  groups.forEach((pieces) => {
    const first = pieces[0];
    if (!first) return;
    first.removeAttribute(AUTOSPLIT_ATTR);
    for (let k = 1; k < pieces.length; k++) {
      let child = pieces[k].firstChild;
      while (child) {
        first.appendChild(child);
        child = pieces[k].firstChild;
      }
      pieces[k].remove();
    }
    first.normalize();
  });

  // Заворачиваем «голый» текст верхнего уровня, чтобы сохранённое тело письма
  // было корректно разложено на страницы при последующих просмотре/печати.
  wrapBareTopLevelNodes(w);

  return w.innerHTML;
};

// Маркер разрыва страницы редактора — тот же, что создаёт кнопка «Новая
// страница». Используется при импорте Word, чтобы перенести разрывы из .docx.
const makeImportPageBreak = (): HTMLElement => {
  const div = document.createElement("div");
  div.setAttribute(PAGE_BREAK_ATTR, "1");
  div.setAttribute("contenteditable", "false");
  div.setAttribute("aria-hidden", "true");
  div.style.cssText =
    "height:0;line-height:0;font-size:0;break-after:page;page-break-after:always;user-select:none;-webkit-user-select:none;pointer-events:none;";
  return div;
};

// Word-разрыв страницы из mammoth приходит ВНУТРИ абзаца (<p>…маркер…</p>),
// а пагинатор видит только разрывы верхнего уровня. Поэтому «поднимаем» маркер:
// делим родительский блок на «до/после» и вставляем настоящий разрыв между ними.
const liftPageBreakMarker = (root: HTMLElement, marker: HTMLElement) => {
  let top: HTMLElement = marker;
  while (top.parentElement && top.parentElement !== root)
    top = top.parentElement;

  if (top === marker) {
    marker.replaceWith(makeImportPageBreak());
    return;
  }

  const range = document.createRange();
  range.setStartAfter(marker);
  range.setEndAfter(top);
  const afterFrag = range.extractContents(); // хвост блока (с сохранением стилей)
  marker.remove();
  top.after(makeImportPageBreak(), afterFrag);
};

// Выравнивание и абзацный отступ в Word часто заданы НЕ напрямую, а в стиле
// абзаца (по умолчанию «Обычный»/docDefaults). mammoth такие наследуемые
// свойства в HTML не выводит, поэтому читаем их из styles.xml самого .docx и
// применяем к абзацам без явного выравнивания. Возвращает выравнивание по
// умолчанию и красную строку (в px при 96 DPI).
const jcToAlign = (jc: string | null): string | null => {
  switch (jc) {
    case "center":
      return "center";
    case "right":
    case "end":
      return "right";
    case "both":
    case "distribute":
      return "justify";
    case "left":
    case "start":
      return "left";
    default:
      return null;
  }
};

// 1 twip = 1/1440 дюйма; px при 96 DPI = twips / 15.
const twipsToPx = (tw: string | null | undefined): number | null => {
  if (tw == null) return null;
  const n = parseInt(tw, 10);
  return isNaN(n) ? null : Math.round(n / 15);
};

type DocxDefaults = {
  align: string | null;
  firstLinePx: number;
  leftPx: number;
};

// Кодируем форматирование абзаца (выравнивание + красная строка + левый отступ)
// в имя стиля/класса. mammoth не умеет выводить inline-стили, поэтому через
// styleMap прокидываем класс, а его потом разбираем в mammothToEditorHtml.
// Возвращает null, если форматирование тривиальное (слева, без отступов).
const paragraphFmtKey = (
  jcVal: string | null | undefined,
  firstLineTwips: string | null | undefined,
  leftTwips: string | null | undefined,
  defaults: DocxDefaults,
): string | null => {
  const align = jcToAlign(jcVal ?? null) ?? defaults.align ?? "left";
  const flDirect = twipsToPx(firstLineTwips);
  const leftDirect = twipsToPx(leftTwips);
  const flPx = Math.max(0, flDirect != null ? flDirect : defaults.firstLinePx);
  const leftPx = Math.max(0, leftDirect != null ? leftDirect : defaults.leftPx);
  if (align === "left" && flPx === 0 && leftPx === 0) return null;
  return `pfmt_${align}_${flPx}_${leftPx}`;
};

// Читает .docx (styles.xml + document.xml) и возвращает форматирование по
// умолчанию и НАБОР всех нужных ключей абзацев — чтобы заранее сгенерировать
// styleMap-правила mammoth (имена стилей известны только после анализа).
const analyzeDocxFormatting = async (
  arrayBuffer: ArrayBuffer,
): Promise<{ defaults: DocxDefaults; fmtKeys: string[] }> => {
  const empty: DocxDefaults = { align: null, firstLinePx: 0, leftPx: 0 };
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(arrayBuffer);
    const stylesXml = await zip.file("word/styles.xml")?.async("string");
    const docXml = await zip.file("word/document.xml")?.async("string");
    const parser = new DOMParser();

    // --- defaults из styles.xml ---
    let defaults = empty;
    if (stylesXml) {
      const sdoc = parser.parseFromString(stylesXml, "application/xml");
      const jcOf = (el: Element | null) =>
        el?.getElementsByTagName("w:jc")[0]?.getAttribute("w:val") || null;
      const indOf = (el: Element | null, attr: string) =>
        el?.getElementsByTagName("w:ind")[0]?.getAttribute(attr) || null;

      const docDefaultPPr =
        sdoc
          .getElementsByTagName("w:pPrDefault")[0]
          ?.getElementsByTagName("w:pPr")[0] || null;
      const defStyle = Array.from(sdoc.getElementsByTagName("w:style")).find(
        (s) =>
          s.getAttribute("w:type") === "paragraph" &&
          s.getAttribute("w:default") === "1",
      );
      const defStylePPr = defStyle?.getElementsByTagName("w:pPr")[0] || null;

      defaults = {
        align: jcToAlign(jcOf(defStylePPr) || jcOf(docDefaultPPr)),
        firstLinePx:
          twipsToPx(
            indOf(defStylePPr, "w:firstLine") ||
              indOf(docDefaultPPr, "w:firstLine"),
          ) || 0,
        leftPx:
          twipsToPx(
            indOf(defStylePPr, "w:left") ||
              indOf(defStylePPr, "w:start") ||
              indOf(docDefaultPPr, "w:left") ||
              indOf(docDefaultPPr, "w:start"),
          ) || 0,
      };
    }

    // --- набор ключей по всем абзацам document.xml ---
    const keys = new Set<string>();
    if (docXml) {
      const ddoc = parser.parseFromString(docXml, "application/xml");
      Array.from(ddoc.getElementsByTagName("w:p")).forEach((p) => {
        const pPr = p.getElementsByTagName("w:pPr")[0] || null;
        const jc =
          pPr?.getElementsByTagName("w:jc")[0]?.getAttribute("w:val") || null;
        const ind = pPr?.getElementsByTagName("w:ind")[0] || null;
        const key = paragraphFmtKey(
          jc,
          ind?.getAttribute("w:firstLine"),
          ind?.getAttribute("w:left") || ind?.getAttribute("w:start"),
          defaults,
        );
        if (key) keys.add(key);
      });
    }

    return { defaults, fmtKeys: Array.from(keys) };
  } catch {
    return { defaults: empty, fmtKeys: [] };
  }
};

export const CreateInternalCorrespondence = ({
  id,
  onBack = () => {},
  initialData,
}: {
  id?: string | number;
  onBack?: () => void;
  initialData?: any;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Контекст «Ответить»/«Перенаправить»: данные исходного входящего письма
  // приходят через navigate state со страницы просмотра входящего.
  const composeState = (location.state || null) as {
    composeMode?: "reply" | "forward";
    sourceLetter?: {
      id?: string | number;
      subject?: string;
      creator?: {
        id?: string | number;
        full_name?: string;
        position?: string;
        department?: string;
      };
      senderName?: string;
      date?: string;
      status?: string;
      priority?: string;
      inboundNumber?: string;
      body?: string;
    };
  } | null;
  const composeMode = composeState?.composeMode;
  const sourceLetter = composeState?.sourceLetter;

  // Связь ответа/пересылки с исходным письмом. Контекст приходит двумя путями:
  // со страницы просмотра входящего (composeMode + sourceLetter.id) либо из
  // реестра исходящих (source_correspondence_id + link_type напрямую в state).
  // Нормализуем к паре полей бэкенда — их всегда передаём вместе.
  const linkState = (location.state || null) as {
    source_correspondence_id?: string | number;
    link_type?: "reply" | "forward";
  } | null;
  const sourceCorrespondenceId =
    linkState?.source_correspondence_id ?? sourceLetter?.id ?? null;
  const linkType: "reply" | "forward" | null =
    linkState?.link_type ?? composeMode ?? null;

  // Блок «Исходное письмо» показываем не только ДО сохранения (из navigate
  // state), но и ПОСЛЕ — GET уже отдаёт link_type + source_document связанного
  // письма. Здесь собираем поля для панели из сохранённого ответа как фолбэк.
  // ВАЖНО: только для отображения. Префилл темы/получателей и боковой A4-показ
  // исходного письма ниже завязаны строго на navigate state (composeMode/
  // sourceLetter), чтобы при открытии готового черновика ничего не перетиралось.
  const savedItem = initialData?.item;
  const savedLinkType: "reply" | "forward" | null =
    savedItem?.link_type === "reply" || savedItem?.link_type === "forward"
      ? savedItem.link_type
      : null;
  const savedSourceDoc = savedItem?.source_document;
  // Тело исходного письма source_document не содержит — достаём из incoming_links.
  const savedSourceBody: string | undefined =
    savedItem?.incoming_links?.find(
      (l: any) => Number(l?.incoming_id) === Number(savedSourceDoc?.id),
    )?.incoming?.body ?? undefined;

  const panelMode: "reply" | "forward" | undefined =
    composeMode ?? savedLinkType ?? undefined;
  const panelSource = sourceLetter
    ? sourceLetter
    : savedSourceDoc
      ? {
          id: savedSourceDoc.id,
          subject: savedSourceDoc.subject,
          creator: savedSourceDoc.creator,
          senderName: savedSourceDoc.creator?.full_name,
          date: savedSourceDoc.sent_at
            ? new Date(savedSourceDoc.sent_at).toLocaleDateString("ru-RU")
            : savedSourceDoc.created_at
              ? new Date(savedSourceDoc.created_at).toLocaleDateString("ru-RU")
              : "—",
          status: savedSourceDoc.status,
          priority: undefined as string | undefined,
          inboundNumber:
            savedSourceDoc.reg_number || savedSourceDoc.tracking_number || "—",
          body: savedSourceBody,
        }
      : undefined;

  const [to, setTo] = useState<RecipientOption[]>([]);
  const [cc, setCc] = useState<RecipientOption[]>([]);
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [previewAttachment, setPreviewAttachment] = useState<AttachedFile | null>(null);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [finalSigner, setFinalSigner] = useState<FinalSigner | null>(null);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showCcDropdown, setShowCcDropdown] = useState(false);
  const [toSearch, setToSearch] = useState("");
  const [ccSearch, setCcSearch] = useState("");
  const [approversOpen, setApproversOpen] = useState(false);
  const [signerOpen, setSignerOpen] = useState(false);
  const [incomingOpen, setIncomingOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  // Демо-режим (для показа руководству): «цилиндры» разделов выносятся в
  // горизонтальную панель под тулбаром, а боковые вкладки у холста скрываются.
  // Сами панели по-прежнему открываются у холста. По умолчанию выключен —
  // текущий функционал не меняется.
  const [panelsInToolbar, setPanelsInToolbar] = useState(true);

  const handleOpenApprovers = () => {
    setApproversOpen(true);
    setSignerOpen(false);
    setIncomingOpen(false);
    setVersionsOpen(false);
    setAttachmentsOpen(false);
  };

  const handleOpenSigner = () => {
    setSignerOpen(true);
    setApproversOpen(false);
    setIncomingOpen(false);
    setVersionsOpen(false);
    setAttachmentsOpen(false);
  };

  const handleOpenIncoming = () => {
    setIncomingOpen(true);
    setApproversOpen(false);
    setSignerOpen(false);
    setVersionsOpen(false);
    setAttachmentsOpen(false);
  };

  const handleOpenVersions = () => {
    setVersionsOpen(true);
    setApproversOpen(false);
    setSignerOpen(false);
    setIncomingOpen(false);
    setAttachmentsOpen(false);
  };

  const handleOpenAttachments = () => {
    setAttachmentsOpen(true);
    setApproversOpen(false);
    setSignerOpen(false);
    setIncomingOpen(false);
    setVersionsOpen(false);
  };
  const [showCcField, setShowCcField] = useState(false);
  const [sent, setSent] = useState(false);
  const [formExpanded, setFormExpanded] = useState(true);
  const [letterType, setLetterType] = useState<string | null>(null);
  const [showLetterTypeDropdown, setShowLetterTypeDropdown] = useState(false);
  const [importance, setImportance] = useState<ImportanceLevel>("normal");
  const [showImportanceDropdown, setShowImportanceDropdown] = useState(false);
  const [fontSize, setFontSize] = useState("14");
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [orientation, setOrientation] = useState<PageOrientation>("portrait");
  // Показ сантиметровой линейки над листом (переключатель в панели редактора).
  const [rulerEnabled, setRulerEnabled] = useState(false);
  // Поля страницы (px) — регулируются перетаскиванием маркеров линейки. Задают
  // ширину колонки набора, поэтому влияют на перенос текста, пагинацию и печать.
  const [marginLeft, setMarginLeft] = useState(80);
  const [marginRight, setMarginRight] = useState(80);
  // Смена ориентации меняет ширину листа — зажимаем поля, чтобы колонка набора
  // не «схлопнулась» в узком портрете после широкого альбома.
  useEffect(() => {
    const w = orientation === "landscape" ? 1122 : 794;
    const cap = Math.round((w - 160) / 2);
    setMarginLeft((l) => Math.max(16, Math.min(l, cap)));
    setMarginRight((r) => Math.max(16, Math.min(r, cap)));
  }, [orientation]);
  const [showPreview, setShowPreview] = useState(false);
  const [showCancelSignConfirm, setShowCancelSignConfirm] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  // Страницы для предпросмотра — берём из разложенного редактора в момент
  // открытия, чтобы предпросмотр совпадал с холстом 1-в-1.
  const [previewPages, setPreviewPages] = useState<string[]>([]);
  const [previewStamp, setPreviewStamp] = useState<{
    pageIndex: number;
    x: number;
    y: number;
    width: string;
    html?: string;
  } | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [pageCount, setPageCount] = useState(1);
  // Индекс страницы, для которой показываем подтверждение удаления
  const [pageToDelete, setPageToDelete] = useState<number | null>(null);

  // Управление плавающим плейсхолдером ЭЦП ДО подписания
  const [stampVisible, setStampVisible] = useState(false);
  const [stampPos, setStampPos] = useState({ x: 40, y: 40 });
  const [stampSize, setStampSize] = useState({
    width: DS_STAMP_DEFAULT_WIDTH,
    height: DS_STAMP_DEFAULT_HEIGHT,
  });

  const [docCreator, setDocCreator] = useState<any>(null);
  const [folder, setFolder] = useState<string | number>("drafts");
  const [attachedIncomingLetters, setAttachedIncomingLetters] = useState<any[]>(
    [],
  );
  const [showIncomingSearch, setShowIncomingSearch] = useState(false);
  const [incomingLetterSearch, setIncomingLetterSearch] = useState("");
  // Идёт конвертация загруженного .docx (mammoth) — блокируем кнопку импорта
  const [importingWord, setImportingWord] = useState(false);
  // Над редактором тащат файл — показываем подсказку-оверлей для импорта
  const [isDraggingWord, setIsDraggingWord] = useState(false);
  // Режим просмотра входящего письма включён по умолчанию, когда страница
  const [showOriginalLetterSides, setShowOriginalLetterSides] = useState(
    !!(panelMode && panelSource),
  );
  const [showVersionCompareSides, setShowVersionCompareSides] = useState(false);

  const toggleOriginalLetterSides = (checked: boolean) => {
    setShowOriginalLetterSides(checked);
    if (checked) {
      setShowVersionCompareSides(false);
    }
  };

  const toggleVersionCompareSides = (checked: boolean) => {
    setShowVersionCompareSides(checked);
    if (checked) {
      setShowOriginalLetterSides(false);
    }
  };

  useEffect(() => {
    if (panelMode && panelSource) {
      setShowOriginalLetterSides((prev) => {
        if (prev === false) return false;
        setShowVersionCompareSides(false);
        return true;
      });
    }
  }, [panelMode, panelSource]);

  const [originalPage, setOriginalPage] = useState(0);
  const originalSheets = useMemo((): { pages: string[]; stamp: StampInfo } => {
    if (!panelMode || !panelSource || !panelSource.body) return { pages: [], stamp: null };
    const res = paginateHtml(panelSource.body, 14);
    const pages = [...res.pages];
    if (res.stamp) while (pages.length <= res.stamp.pageIndex) pages.push("");
    return { pages, stamp: res.stamp };
  }, [panelMode, panelSource]);
  const originalTotal = Math.max(originalSheets.pages.length, 1);
  const originalCurrent = Math.min(originalPage, originalTotal - 1);

  const [versionComparePage, setVersionComparePage] = useState(0);

  const composeAppliedRef = useRef(false);
  const isDraggingStamp = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const stampRef = useRef<HTMLDivElement>(null);
  const pageCanvasRef = useRef<HTMLDivElement>(null);
  const rootScrollRef = useRef<HTMLDivElement>(null);
  const originalCanvasWrapRef = useRef<HTMLDivElement>(null);
  const versionCompareCanvasWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeWrap = showVersionCompareSides
      ? versionCompareCanvasWrapRef.current
      : showOriginalLetterSides
      ? originalCanvasWrapRef.current
      : null;
    if (!activeWrap) return;
    const scroller = rootScrollRef.current;
    const canvas = pageCanvasRef.current;
    if (!scroller || !canvas) return;

    const BOT_M = 24;
    let shift = 0;

    const update = () => {
      const TOP_M = (stickyHeaderRef.current?.offsetHeight ?? 40) + 12;
      const viewH = scroller.clientHeight;
      const wrapH = activeWrap.offsetHeight;
      const canvasTop =
        canvas.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      const maxShift = Math.max(canvas.offsetHeight - wrapH, 0);

      if (wrapH <= viewH - TOP_M - BOT_M) {
        shift = TOP_M - canvasTop;
      } else {
        const pinTop = TOP_M - canvasTop;
        const pinBottom = viewH - BOT_M - wrapH - canvasTop;
        shift = Math.min(Math.max(shift, pinBottom), pinTop);
      }
      shift = Math.min(Math.max(shift, 0), maxShift);
      activeWrap.style.transform = shift > 0 ? `translateY(${shift}px)` : "";
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [showOriginalLetterSides, showVersionCompareSides, composeMode, sourceLetter]);

  // Обёртка боковых панелей (История версий / Входящие письма / Согласующие /
  // Подписывающий). Прижимаем её к верху видимой области при прокрутке, чтобы
  // вкладки и раскрытая панель были доступны на любой странице документа.
  const panelsGroupRef = useRef<HTMLDivElement>(null);
  // Липкая шапка редактора: тулбар форматирования + панель разделов +
  // пагинация входящего письма. Нужна её высота, чтобы прижимать боковые
  // панели под неё, а не под самый верх экрана.
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const paginateEditorRef = useRef<(() => number) | null>(null);
  // Высота содержимого редактора после последней пагинации. Нужна страховке на
  // ResizeObserver, чтобы отличать собственные правки пагинатора (высота уже
  // учтена) от внешних изменений (картинка загрузилась, innerHTML заменили).
  const lastPaginatedHeightRef = useRef(0);

  const isLandscape = orientation === "landscape";
  const PAGE_WIDTH = isLandscape ? 1122 : 794;
  const PAGE_HEIGHT = isLandscape ? 794 : 1122;
  const PAGE_PAD_V = 72;
  const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PAD_V * 2;
  const PAGE_GAP = 32; // визуальный отступ между листами
  const PAGE_STRIDE = PAGE_HEIGHT + PAGE_GAP;

  // Sticky-позиционирование левого A4-холста входящего письма: при прокрутке
  // страницы холст остаётся на виду рядом с редактируемым исходящим письмом.
  // CSS position:sticky здесь не работает — между холстом и вертикальным
  // скролл-контейнером страницы стоит серая область с overflow-auto
  // (горизонтальная прокрутка), которая перехватывает sticky. Поэтому смещаем
  // холст вручную по scroll/resize через transform. Опорная точка — правый
  // холст (pageCanvasRef): оба лежат в одном flex-ряду с items-start, их
  // верхние края совпадают, а сам он не трансформируется.
  useEffect(() => {
    if (!showOriginalLetterSides || !composeMode || !sourceLetter) return;
    const scroller = rootScrollRef.current;
    const wrap = originalCanvasWrapRef.current;
    const canvas = pageCanvasRef.current;
    if (!scroller || !wrap || !canvas) return;

    // Лист прилипает ПОД липкой шапкой редактора (тулбар + панель разделов +
    // пагинация). Её высота динамическая, поэтому берём её в рантайме. Сам лист
    // за счёт maxHeight (в OriginalLetterCanvas) помещается в окно целиком — его
    // содержимое при нехватке высоты прокручивается внутри.
    const BOT_M = 24;
    let shift = 0;

    const update = () => {
      const TOP_M = (stickyHeaderRef.current?.offsetHeight ?? 40) + 12;
      const viewH = scroller.clientHeight;
      const wrapH = wrap.offsetHeight;
      const canvasTop =
        canvas.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      const maxShift = Math.max(canvas.offsetHeight - wrapH, 0);

      if (wrapH <= viewH - TOP_M - BOT_M) {
        // Холст помещается в окно целиком — прилипает под панелью пагинации.
        shift = TOP_M - canvasTop;
      } else {
        // Страховка на случай расхождения измерений на пару пикселей:
        // двусторонний sticky (вниз — прилипает нижним краем, вверх — верхним).
        const pinTop = TOP_M - canvasTop;
        const pinBottom = viewH - BOT_M - wrapH - canvasTop;
        shift = Math.min(Math.max(shift, pinBottom), pinTop);
      }
      shift = Math.min(Math.max(shift, 0), maxShift);
      wrap.style.transform = shift > 0 ? `translateY(${shift}px)` : "";
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      wrap.style.transform = "";
    };
  }, [
    showOriginalLetterSides,
    composeMode,
    sourceLetter,
    pageCount,
    orientation,
    formExpanded,
    panelsInToolbar,
  ]);

  // Боковые панели (вкладки + раскрытая панель) спозиционированы абсолютно
  // внутри высокого холста (pageCanvasRef, высотой во все страницы), поэтому
  // при прокрутке вниз уходили за верх экрана — чтобы выбрать версию/участника,
  // приходилось скроллить в самое начало. Держим группу в поле зрения: смещаем
  // её по вертикали за прокруткой через transform (position:sticky здесь не
  // работает — его перехватывает серая область с overflow), а высоту раскрытой
  // панели ограничиваем видимой областью (переменная --icc-panel-max-h), чтобы
  // её внутренний список прокручивался на месте. Тот же приём, что для левого
  // A4-холста входящего письма выше.
  useEffect(() => {
    if (!id) return;
    const scroller = rootScrollRef.current;
    const canvas = pageCanvasRef.current;
    const group = panelsGroupRef.current;
    if (!scroller || !canvas || !group) return;

    const BOT_M = 24; // нижний отступ для раскрытой панели
    const MIN_VISIBLE = 160; // минимум пикселей группы, что держим над холстом

    const update = () => {
      // Прижимаем группу не к самому верху, а ПОД липкую шапку редактора
      // (тулбар + панель разделов), иначе её содержимое пряталось бы под ней.
      const headerH = stickyHeaderRef.current?.offsetHeight ?? 0;
      const TOP_M = headerH + 12;
      const canvasTop =
        canvas.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      let shift = Math.max(0, TOP_M - canvasTop);
      shift = Math.min(shift, Math.max(0, canvas.offsetHeight - MIN_VISIBLE));
      // Верх группы в координатах видимой области: от него отсчитываем
      // доступную высоту, чтобы низ раскрытой панели не уезжал под экран.
      const groupViewportTop = canvasTop + shift;
      const availH = Math.max(
        200,
        scroller.clientHeight - groupViewportTop - BOT_M,
      );
      group.style.setProperty("--icc-panel-max-h", `${availH}px`);
      group.style.transform = shift > 0 ? `translateY(${shift}px)` : "";
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    // Высота липкой шапки меняется (перенос кнопок на новую строку, включение
    // панели разделов, пагинация входящего) — пересчитываем позицию панелей.
    const headerRO = new ResizeObserver(update);
    if (stickyHeaderRef.current) headerRO.observe(stickyHeaderRef.current);
    return () => {
      scroller.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      headerRO.disconnect();
      group.style.transform = "";
    };
  }, [id, pageCount, orientation, formExpanded, panelsInToolbar]);

  const [searchParams, setSearchParams] = useState({ query: "" });
  const handleOpenRecipientModal = () => {
    setSearchParams({ query: "" });
    setShowRecipientModal(true);
  };

  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS,
    useToken: true,
    params: searchParams,
  });

  // Справочники типов документа и приоритетов: подписи берём отсюда, не хардкодим
  const { data: metaData } = useGetQuery({
    url: ApiRoutes.GET_INTERNAL_META,
    useToken: true,
  });

  // Опции типа письма: ключ+подпись из /meta, описание дополняем локально.
  // До загрузки /meta используем фолбэк-константу.
  const letterTypeOptions = useMemo(() => {
    const metaTypes: MetaOption[] = metaData?.data?.document_types || [];
    if (!metaTypes.length) return LETTER_TYPE_OPTIONS;
    return metaTypes.map((t) => ({
      value: t.key,
      label: t.label,
      desc: LETTER_TYPE_DESC[t.key] ?? LETTER_TYPE_DESC[t.label] ?? "",
    }));
  }, [metaData]);

  // Опции важности: ключ+подпись из /meta, стили (цвета/флажок) берём локально по ключу.
  const importanceStyleByKey = useMemo(
    () => Object.fromEntries(IMPORTANCE_OPTIONS.map((o) => [o.value, o])),
    [],
  );
  const importanceOptions = useMemo(() => {
    const metaPriorities: MetaOption[] = metaData?.data?.priorities || [];
    if (!metaPriorities.length) return IMPORTANCE_OPTIONS;
    return metaPriorities.map((p) => {
      const style = importanceStyleByKey[p.key] ?? IMPORTANCE_OPTIONS[1];
      return { ...style, value: p.key as ImportanceLevel, label: p.label };
    });
  }, [metaData, importanceStyleByKey]);

  const { data: rawWorkflowData, refetch: refetchWorkflow } = useGetQuery({
    url: id ? ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id)) : "",
    useToken: true,
    options: { enabled: !!id },
  });

  // id последней версии, которую мы автоматически подгрузили в редактор.
  // Позволяет переключаться на новую версию после сохранения/подписания,
  // но не сбрасывать выбранную вручную старую версию при обычном рефетче.
  const autoLoadedLatestRef = useRef<string | number | null>(null);

  // Запрос списка версий документа
  const { data: versionsResponse, refetch: refetchVersions } = useGetQuery({
    url: id ? ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(id)) : "",
    useToken: true,
    options: {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  });

  const { data: rawStructureData } = useGetQuery<
    Record<string, unknown>,
    { data: any }
  >({
    url: id ? ApiRoutes.GET_INTERNAL_STRUCTURE.replace(":id", String(id)) : "",
    useToken: true,
    options: {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  });

  const relatedDocs = rawStructureData?.data?.related_documents || [];


  const hasSignedWorkflowSignature = useMemo(() => {
    const wfSigs = rawWorkflowData?.data?.signatures || [];
    return wfSigs.some((sig: any) => sig.status === "signed");
  }, [rawWorkflowData]);

  const revokedVersionIds = useMemo(() => {
    const ids = new Set<number | string>();
    const wfSignatures = rawWorkflowData?.data?.signatures || [];
    wfSignatures.forEach((s: any) => {
      if (s.status === "revoked") {
        if (s.version_id) ids.add(s.version_id);
        if (s.payload_json?.version_id) ids.add(s.payload_json.version_id);
      }
    });
    return ids;
  }, [rawWorkflowData]);

  // Массив всех версий с бэкенда
  const allVersions = useMemo(() => {
    const rawVersions = versionsResponse?.data?.versions || [];
    return rawVersions.map((v: any, idx: number) => {
      const isExplicitRevoked =
        v.signature_state === "revoked" ||
        revokedVersionIds.has(v.id) ||
        (v.parent_id && revokedVersionIds.has(v.parent_id)) ||
        (!hasSignedWorkflowSignature &&
          typeof v.body === "string" &&
          v.body.includes(STAMP_ATTR));

      return {
        id: v.id,
        parent_id: v.parent_id,
        versionNumber: v.version || idx + 1,
        content: v.body,
        date: v.created_at,
        author: v.author
          ? {
              id: String(v.author.id),
              name: v.author.full_name || "Неизвестный автор",
              position: v.author.position || "Сотрудник",
              initials: (v.author.full_name || "НА")
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join(""),
            }
          : {
              id: "unknown",
              name: "Неизвестный автор",
              position: "Сотрудник",
              initials: "НА",
            },
        is_selected: v.is_selected,
        is_current_signed: v.is_current_signed && !isExplicitRevoked,
        signature_state: isExplicitRevoked ? "revoked" : v.signature_state,
        signature_revoked_at: v.signature_revoked_at,
        signature_signed_at: v.signature_signed_at,
      };
    });
  }, [versionsResponse, revokedVersionIds, hasSignedWorkflowSignature]);

  // Список уникальных авторов для выпадающего фильтра
  const versionAuthors = useMemo(() => {
    const authorsMap: Record<string, { name: string; count: number }> = {};
    allVersions.forEach((v: any) => {
      if (!authorsMap[v.author.id]) {
        authorsMap[v.author.id] = { name: v.author.name, count: 0 };
      }
      authorsMap[v.author.id].count += 1;
    });
    return Object.entries(authorsMap).map(([id, meta]) => ({
      id,
      name: meta.name,
      count: meta.count,
    }));
  }, [allVersions]);

  const [selectedAuthorId, setSelectedAuthorId] = useState<
    string | number | null
  >(null);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);

  const initialActiveVersion =
    allVersions.length > 0 ? allVersions[allVersions.length - 1].id : null;
  const [activeVersionId, setActiveVersionId] = useState<
    string | number | null
  >(initialActiveVersion);

  const filteredVersions = useMemo(() => {
    if (!selectedAuthorId) return allVersions;
    return allVersions.filter(
      (v: any) => v.author.id === String(selectedAuthorId),
    );
  }, [allVersions, selectedAuthorId]);

  const latestVersion = useMemo(
    () => (allVersions.length > 0 ? allVersions[allVersions.length - 1] : null),
    [allVersions],
  );
  const latestVersionId = latestVersion ? latestVersion.id : null;
  // В режиме сравнения версий выбор предыдущей версии влияет только на ЛЕВЫЙ
  // холст (versionCompareSheets). Правый холст всегда держит последнюю версию
  // (см. эффект синхронизации editorRef ниже) и должен оставаться активным для
  // редактирования/сохранения, поэтому здесь «старая версия» не считается
  // выбранной. Блокировка подписанного документа остаётся через isSigned.
  const isOldVersionSelected =
    !showVersionCompareSides &&
    activeVersionId !== null &&
    activeVersionId !== latestVersionId;

  const activeVersion = useMemo(
    () => allVersions.find((v: any) => v.id === activeVersionId) || latestVersion || null,
    [allVersions, activeVersionId, latestVersion],
  );

  const versionCompareSheets = useMemo((): { pages: string[]; stamp: StampInfo } => {
    if (!showVersionCompareSides || !activeVersion || !activeVersion.content) {
      return { pages: [], stamp: null };
    }
    const res = paginateHtml(activeVersion.content, Number(fontSize) || 14);
    const pages = [...res.pages];
    if (res.stamp) while (pages.length <= res.stamp.pageIndex) pages.push("");
    return { pages, stamp: res.stamp };
  }, [showVersionCompareSides, activeVersion, fontSize]);

  const versionCompareTotal = Math.max(versionCompareSheets.pages.length, 1);
  const versionCompareCurrent = Math.min(versionComparePage, versionCompareTotal - 1);

  const isActiveVersionForSign = activeVersion ? !!activeVersion.is_selected : false;

  const signedVersionId = useMemo(() => {
    if (!hasSignedWorkflowSignature) return null;
    const backendSigned = allVersions.find(
      (v: any) => v.is_current_signed && v.signature_state !== "revoked",
    );
    if (backendSigned) return backendSigned.id;
    const stamped = allVersions.filter(
      (v: any) =>
        v.signature_state !== "revoked" &&
        typeof v.content === "string" &&
        v.content.includes(STAMP_ATTR),
    );
    if (stamped.length) return stamped[stamped.length - 1].id;
    return null;
  }, [allVersions, hasSignedWorkflowSignature]);

  const { mutate: selectVersionForSign, isPending: isSelectingVersion } =
    useMutationQuery<{ versionId: string | number }, any>({
      url: (requestData) =>
        ApiRoutes.SELECT_INTERNAL_VERISION_FOR_SIGN.replace(
          ":correspondenceId",
          String(id || ""),
        ).replace(":versionId", String(requestData.versionId)),
      method: "POST",
      messages: {
        suppressSuccessToast: true,
        invalidate: [
          ApiRoutes.GET_INTERNAL_VERSIONS.replace(":id", String(id || "")),
        ],
      },
    });


  const handleSetVersionForSign = (clickedVersionId: string | number) => {
    selectVersionForSign({ versionId: clickedVersionId });
  };

  // Правый холст в режиме сравнения синхронизируем с последней версией только
  // при ВХОДЕ в режим и при появлении новой последней версии (новый id). При
  // переключении сравниваемой (левой) версии activeVersion меняется, но правый
  // холст трогать нельзя — иначе затрутся несохранённые правки пользователя.
  const lastCompareSyncRef = useRef<string | number | null>(null);
  useEffect(() => {
    if (showVersionCompareSides && latestVersion && latestVersion.content) {
      if (lastCompareSyncRef.current === latestVersionId) return;
      lastCompareSyncRef.current = latestVersionId;
      if (editorRef.current && editorRef.current.innerHTML !== latestVersion.content) {
        editorRef.current.innerHTML = latestVersion.content;
        setEditorContent(latestVersion.content);
        if (paginateEditorRef.current) {
          const nextPageCount = paginateEditorRef.current();
          setPageCount(nextPageCount);
        }
      }
    } else if (!showVersionCompareSides) {
      // Вышли из режима сравнения — сбрасываем метку, чтобы повторный вход снова
      // подтянул актуальную версию в правый холст.
      lastCompareSyncRef.current = null;
      if (activeVersion && activeVersion.content) {
        if (editorRef.current && editorRef.current.innerHTML !== activeVersion.content) {
          editorRef.current.innerHTML = activeVersion.content;
          setEditorContent(activeVersion.content);
          if (paginateEditorRef.current) {
            const nextPageCount = paginateEditorRef.current();
            setPageCount(nextPageCount);
          }
        }
      }
    }
  }, [showVersionCompareSides, latestVersion, latestVersionId, activeVersion]);

  const handleSelectVersion = (content: string, versionId: string | number) => {
    setActiveVersionId(versionId);
    if (!showVersionCompareSides) {
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
        setEditorContent(content);
        const target = allVersions.find((v: any) => v.id === versionId);
        if (!target?.is_selected && !finalSigner?.dsApplied) {
          setStampVisible(false);
        }
        if (paginateEditorRef.current) {
          const nextPageCount = paginateEditorRef.current();
          setPageCount(nextPageCount);
        }
        resetHistory();
      }
    }
  };

  const availableUsers: RecipientOption[] =
    usersData?.data?.data?.map((u: any) => {
      const fullName = u.full_name || "";
      return {
        id: String(u.id),
        name: fullName,
        org: u.position || u.department || "Сотрудник",
        initials: fullName
          .split(" ")
          .map((n: string) => n[0])
          .join(""),
        color: "bg-blue-100 text-blue-700",
      };
    }) || [];

  // После успешного сохранения файлы уже лежат на бэкенде: заменяем локальную
  // очередь списком из ответа. Иначе следующее сохранение отправит те же файлы
  // повторно и в письме появятся дубликаты.
  const syncAttachmentsAfterSave = useCallback(
    (data: any) => {
      const saved = data?.item?.attachments;
      const docId = id || data?.item?.id;
      if (Array.isArray(saved))
        setAttachments(saved.map((a: any) => mapServerAttachment(a, docId)));
      else setAttachments((prev) => prev.filter((a) => !a.file));
    },
    [id],
  );

  const { mutate: createDraft, isPending: isCreating } = useMutationQuery<any>({
    url: ApiRoutes.CREATE_INTERNAL,
    method: "POST",
    messages: { invalidate: [ApiRoutes.GET_INTERNAL_DRAFTS] },
    queryOptions: {
      onSuccess: (data: any) => {
        syncAttachmentsAfterSave(data);
        const newId = data?.item?.id;
        if (newId)
          navigate(`/modules/correspondence/internal/outgoing/${newId}`, {
            replace: true,
            state: location.state,
          });
      },
    },
  });

  // Обновление черновика создаёт на бэкенде новую версию письма — общий хвост
  // для обоих режимов сохранения (JSON и multipart, см. saveDraft ниже).
  const handleDraftUpdated = useCallback(
    (data: any) => {
      syncAttachmentsAfterSave(data);
      // 1. Сначала стягиваем свежие версии, чтобы узнать ID только что созданной (1.6)
      refetchVersions().then((updatedResponse) => {
        const freshVersions = updatedResponse?.data?.data?.versions;

        if (Array.isArray(freshVersions) && freshVersions.length > 0) {
          const latestVersion = freshVersions[freshVersions.length - 1];

          if (latestVersion?.id) {
            // 2. Мгновенно меняем активную версию в стейте фронтенда
            setActiveVersionId(latestVersion.id);

            // 3. Передаем в selectVersionForSign колбэк для повторного рефетча ПОСЛЕ успешного выбора
            selectVersionForSign(
              { versionId: latestVersion.id },
              {
                onSuccess: () => {
                  // 4. Перезапрашиваем версии еще раз, когда бэкенд точно проставил галочку в БД
                  refetchVersions();
                },
              },
            );
          }
        }
      });
    },
    [refetchVersions, selectVersionForSign, syncAttachmentsAfterSave],
  );

  const updateDraftMessages = {
    invalidate: [
      ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", String(id || "")),
      // Убираем отсюда автоматический инвалейд версий, чтобы контролировать поток вручную
    ],
  };

  const { mutate: updateDraft, isPending: isUpdating } = useMutationQuery<any>({
    url: ApiRoutes.PUT_INTERNAL.replace(":id", String(id || "")),
    method: "PUT",
    messages: updateDraftMessages,
    queryOptions: { onSuccess: handleDraftUpdated },
  });

  const { mutate: updateDraftSilent } = useMutationQuery<any>({
    url: ApiRoutes.PUT_INTERNAL.replace(":id", String(id || "")),
    method: "PUT",
    messages: {
      ...updateDraftMessages,
      suppressSuccessToast: true,
    },
    queryOptions: { onSuccess: handleDraftUpdated },
  });

  // Тот же PUT, но с новыми вложениями в теле. Метод именно POST: PHP не
  // разбирает файлы в теле настоящего PUT, поэтому реальный метод уезжает
  // на бэкенд полем `_method` (см. saveDraft).
  const { mutate: updateDraftWithFiles, isPending: isUpdatingWithFiles } =
    useMutationQuery<FormData>({
      url: ApiRoutes.PUT_INTERNAL.replace(":id", String(id || "")),
      method: "POST",
      messages: updateDraftMessages,
      queryOptions: { onSuccess: handleDraftUpdated },
    });

  const { mutate: updateDraftWithFilesSilent } = useMutationQuery<FormData>({
    url: ApiRoutes.PUT_INTERNAL.replace(":id", String(id || "")),
    method: "POST",
    messages: {
      ...updateDraftMessages,
      suppressSuccessToast: true,
    },
    queryOptions: { onSuccess: handleDraftUpdated },
  });

  /**
   * Сохраняет черновик, сам выбирая формат запроса. Пока новых файлов нет —
   * шлём привычный JSON. Если есть — тот же payload уходит multipart-ом вместе
   * с файлами: отдельного эндпоинта для загрузки вложений у внутренней
   * корреспонденции нет, они принимаются прямо в создании/обновлении письма.
   */
  const saveDraft = (
    requestPayload: Record<string, any>,
    options?: { suppressToast?: boolean },
  ) => {
    const pending = attachments.filter((a) => a.file);

    if (options?.suppressToast) {
      if (!pending.length) {
        if (id) updateDraftSilent(requestPayload);
        else createDraft(requestPayload);
        return;
      }
      const form = buildFormData(requestPayload);
      pending.forEach((a) => form.append("attachments[]", a.file!));
      if (id) {
        form.append("_method", "PUT");
        updateDraftWithFilesSilent(form);
      } else {
        createDraft(form);
      }
      return;
    }

    if (!pending.length) {
      if (id) updateDraft(requestPayload);
      else createDraft(requestPayload);
      return;
    }

    const form = buildFormData(requestPayload);
    pending.forEach((a) => form.append("attachments[]", a.file!));

    if (id) {
      form.append("_method", "PUT");
      updateDraftWithFiles(form);
    } else {
      createDraft(form);
    }
  };


  // Загрузка файлов идёт тем же запросом, что и сам черновик, поэтому
  // «Сохранить» ждёт и её тоже.
  const isSaving = isCreating || isUpdating || isUpdatingWithFiles;

  const { mutate: inviteSigner, isPending: isSignerInviting } =
    useMutationQuery<any>({
      url: (req) =>
        ApiRoutes.INTERNAL_INVITE_SIGNER?.replace(":id", String(req.docId)),
      method: "POST",
      messages: {
        success: "Подписывающий назначен",
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
        ],
      },
      queryOptions: { onSuccess: () => refetchWorkflow() },
    });

  const { mutate: inviteApprover, isPending: isApproverInviting } =
    useMutationQuery<any>({
      url: (req) =>
        ApiRoutes.INTERNAL_INVITE_APPROVER?.replace(":id", String(req.docId)),
      method: "POST",
      messages: {
        success: "Согласующий приглашен",
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
        ],
      },
      queryOptions: { onSuccess: () => refetchWorkflow() },
    });

  const { mutate: attachIncoming } = useMutationQuery<any>({
    url: id
      ? ApiRoutes.ATTACH_INTERNAL_INCOMING?.replace(":id", String(id))
      : "",
    method: "POST",
    messages: {
      success: "Письмо прикреплено",
      invalidate: [
        ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
      ],
    },
    queryOptions: { onSuccess: () => refetchWorkflow() },
  });

  const { mutate: sendCorrespondence, isPending: isSending } =
    useMutationQuery<any>({
      url: ApiRoutes.SEND_INTERNAL.replace(":id", String(id || "")),
      method: "POST",
      messages: {
        success: "Письмо успешно отправлено",
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW,
          ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", String(id || "")),
        ],
      },
      queryOptions: {
        onSuccess: () => {
          setSent(true);
        },
      },
    });

  const isAlreadySent = initialData?.item?.status === "sent";

  const currentUserId = tokenControl.getUserId() || tokenControl.getUserData()?.id;
  const pendingSignature = rawWorkflowData?.data?.signatures?.find(
    (sig: any) => sig.status === "pending"
  );
  const isCurrentSigner = pendingSignature && currentUserId && String(currentUserId) === String(pendingSignature.user_id || pendingSignature.user?.id);
  const canDecline = !!pendingSignature && !!isCurrentSigner;

  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleDeclineClick = () => {
    setShowDeclineModal(true);
  };

  const handleConfirmDecline = async (reasonText: string) => {
    setIsDeclining(true);
    try {
      const payloadData = await signaturesPayloadAsync({ action: "sign" });
      if (payloadData?.signature_id && payloadData?.nonce) {
        signaturesConfirm({
          signature_id: payloadData.signature_id,
          nonce: payloadData.nonce,
          status: "declined",
          reason: reasonText,
          method: "simple",
        });
        setShowDeclineModal(false);
      } else {
        toast.error("Не удалось получить параметры для отклонения");
      }
    } catch (error: any) {
      toast.error(error?.message || "Ошибка при отклонении документа");
    } finally {
      setIsDeclining(false);
    }
  };

  const assignSelfAsSigner = () => {
    if (!docCreator) return;
    setFinalSigner({
      id: String(docCreator.id),
      isInvited: false,
      name: docCreator.full_name,
      role: docCreator.position || "Автор документа",
      initials: docCreator.full_name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join(""),
      color: "bg-purple-100 text-purple-700",
      dsApplied: false,
      dsLoading: false,
    });
  };

  const { mutateAsync: signaturesPayloadAsync } = useMutationQuery<any>({
    url: ApiRoutes.INTERNAL_SIGNATURES_PAYLOAD?.replace(
      ":id",
      String(id || ""),
    ),
    method: "POST",
    messages: {
      suppressSuccessToast: true,
    },
  });

  const { mutate: signaturesCancel, isPending: isCancellingSign } =
    useMutationQuery<any>({
      url: ApiRoutes.INTERNAL_SIGNATURES_CANCEL?.replace(
        ":id",
        String(id || ""),
      ),
      method: "POST",
      messages: {
        suppressSuccessToast: true,
        invalidate: [
          ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
          ApiRoutes.GET_INTERNAL_VERSIONS?.replace(":id", String(id || "")),
          ApiRoutes.GET_INTERNAL_BY_ID?.replace(":id", String(id || "")),
          ...CORRESPONDENCE_INVALIDATE_KEYS,
        ],
      },
      queryOptions: {
        onSuccess: () => {
          toast.success("Подпись отменена. Создана новая версия документа.");
          setShowCancelSignConfirm(false);
          refetchVersions();
        },
      },
    });

  const handleConfirmCancelSignature = (reasonText: string) => {
    signaturesCancel({
      reason: reasonText || undefined,
    });
  };

  const { mutate: signaturesConfirm } = useMutationQuery<any>({
    url: ApiRoutes.INTERNAL_SIGNATURES_CONFIRM?.replace(
      ":id",
      String(id || ""),
    ),
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [
        ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
        ...CORRESPONDENCE_INVALIDATE_KEYS,
      ],
    },
    queryOptions: {
      onSuccess: (_data, variables) => {
        if (variables?.status === "declined") {
          toast.success("Документ успешно отклонен");
          return;
        }

        toast.success("Документ успешно подписан");
        setFinalSigner((prev) =>
          prev ? { ...prev, dsApplied: true, dsLoading: false } : null,
        );

        if (editorRef.current && stampVisible) {
          if (
            !editorRef.current.innerHTML.includes('data-signature-stamp="true"')
          ) {
            // 1. Собираем переменные для штампа
            const stampWidthVal =
              typeof stampSize.width === "number"
                ? stampSize.width
                : DS_STAMP_DEFAULT_WIDTH;
            // Высоту всегда выводим из ширины по пропорциям макета, чтобы вшитая
            // картинка не искажалась относительно SVG (viewBox 760×333).
            const stampHeightVal = dsStampHeightForWidth(stampWidthVal);
            const widthStr = `${stampWidthVal}px`;
            const currentSignerName = finalSigner?.name || "Неизвестно";
            const currentSignerInitials = finalSigner?.initials || "НА";
            const currentDate = new Date().toLocaleDateString("ru-RU");
            const certSerial = `SN-2026-${currentSignerInitials}-84201`;
            const validUntil = "аз 20.03.2025 то 20.03.2026";

            // 2. Единый SVG-рисунок штампа ЭЦП (тот же, что рисует React-
            //    компонент <DSStamp>) — вшиваем его картинкой в тело письма,
            //    чтобы экранный, печатный и боковой штампы были идентичны.
            const fullStampSvg = buildDSStampSvg({
              name: currentSignerName,
              certSerial,
              signedAt: currentDate,
              validUntil,
            });

            const encodedSvg = btoa(unescape(encodeURIComponent(fullStampSvg)));
            const stampDataUri = `data:image/svg+xml;base64,${encodedSvg}`;

            // Использовать строго в одну строку без пробелов внутри тегов, чтобы редактор не вставил текстовые переносы
            const stampHTML = `<div data-signature-stamp="true" contenteditable="false" style="position:absolute;left:${stampPos.x}px;top:${stampPos.y}px;width:${widthStr};height:${stampHeightVal}px;max-height:${stampHeightVal}px;z-index:99;user-select:none;-webkit-user-select:none;cursor:default;overflow:hidden!important;display:block!important;line-height:0!important;padding:0!important;margin:0!important;border:none!important;"><img src="${stampDataUri}" alt="ЭЦП" style="display:block!important;width:100%!important;height:${stampHeightVal}px!important;max-height:${stampHeightVal}px!important;pointer-events:none!important;-webkit-user-drag:none!important;padding:0!important;margin:0!important;border:none!important;outline:none!important;line-height:0!important;" /></div>`;

            editorRef.current.innerHTML += stampHTML;
            // innerHTML-присвоение идёт мимо onInput — синхронизируем стейт,
            // чтобы сохранение/предпросмотр видели тело письма со штампом.
            setEditorContent(getCleanEditorHtml());
            // Подписанное состояние — новая точка отсчёта истории: отмена не
            // должна убирать вшитый штамп ЭЦП.
            resetHistory();
          }
        }

        setStampVisible(false);

        // ВАЖНО: Принудительно вызываем API сохранения, чтобы бэкенд получил новый body с картинкой
        const editorBody = getCleanEditorHtml();
        const requestPayload: any = {
          subject,
          body: editorBody,
          recipients: {
            to: to.map((r) => r.id),
            cc: cc.map((r) => r.id),
          },
          approvals: approvers.map((a) => a.id),
          signatures: finalSigner ? [finalSigner.id] : [],
          document_type: letterType,
          priority: importance,
        };

        // source_correspondence_id и link_type передаём только вместе.
        if (sourceCorrespondenceId != null && linkType) {
          requestPayload.source_correspondence_id = Number(sourceCorrespondenceId);
          requestPayload.link_type = linkType;
        }

        if (id) saveDraft(requestPayload, { suppressToast: true });
      },

      onError: () =>
        setFinalSigner((prev) => (prev ? { ...prev, dsLoading: false } : null)),
    },
  });

  const { mutate: approvalsConfirm } = useMutationQuery<any, any>({
    url: (req) =>
      ApiRoutes.INTERNAL_APPROVALS_CONFIRM?.replace(
        ":id",
        String(req.approvalRecordId),
      ),
    method: "PATCH",
    messages: {
      success: "Решение по согласованию сохранено",
      invalidate: [
        ApiRoutes.INTERNAL_GET_WORKFLOW?.replace(":id", String(id || "")),
        ApiRoutes.GET_INTERNAL_BY_ID?.replace(":id", String(id || "")),
      ],
    },
    queryOptions: {
      onSuccess: (res, req) => {
        const item = res?.data || res?.item;
        setApprovers((prev) =>
          prev.map((a) =>
            a.approvalRecordId === req.approvalRecordId
              ? {
                  ...a,
                  approved: (item?.status || req.status) === "approved",
                  status: item?.status || req.status,
                  note: item?.note !== undefined ? item.note : req.note,
                  comment: item?.note !== undefined ? (item.note || "") : a.comment,
                  decided_at: item?.decided_at || new Date().toISOString(),
                  dsApplied: (item?.status || req.status) === "approved",
                  dsLoading: false,
                }
              : a,
          ),
        );
      },
      onError: (_, req) => {
        setApprovers((prev) =>
          prev.map((a) =>
            a.approvalRecordId === req.approvalRecordId
              ? { ...a, dsLoading: false }
              : a,
          ),
        );
      },
    },
  });

  // Печать документа: используем скрытый iframe и @page margin:0, чтобы браузер
  // НЕ добавлял свои колонтитулы (URL, дату, заголовок). Поля задаём через padding.
  // Единый источник постраничной разбивки: берём УЖЕ разложенный в редакторе DOM
  // и группируем блоки по страницам по их offsetTop. Так и предпросмотр, и печать
  // получают ровно то же содержимое на тех же страницах, что и холст редактора.
  // Каждый блок позиционируем АБСОЛЮТНО по его реальному offsetTop в редакторе —
  // так предпросмотр/печать не перетекают контент заново (без распорок), а
  // повторяют холст пиксель-в-пиксель. Иначе блоки «сползали» и часть текста
  // (например, нижний колонтитул) терялась при печати.
  const getEditorPages = useCallback((): string[] => {
    const editor = editorRef.current;
    if (!editor) return [];
    // «Голый» текст верхнего уровня заворачиваем в блок, иначе он не попадёт ни
    // на одну страницу (перебираем только element-детей) и пропадёт из
    // предпросмотра/печати — как было с одиночной цифрой, набранной в редактор.
    wrapBareTopLevelNodes(editor);
    const contentWidth = PAGE_WIDTH - marginLeft - marginRight;
    const buckets: string[][] = [];
    Array.from(editor.children).forEach((child) => {
      const el = child as HTMLElement;
      if (
        el.hasAttribute(SPACER_ATTR) ||
        el.hasAttribute(PAGE_BREAK_ATTR) ||
        el.hasAttribute(STAMP_ATTR) ||
        getComputedStyle(el).position === "absolute"
      )
        return;
      const top = el.offsetTop;
      const page = Math.max(0, Math.floor(top / PAGE_STRIDE));
      // y внутри листа = поле сверху + смещение от начала страницы
      const localTop = PAGE_PAD_V + (top - page * PAGE_STRIDE);
      // вертикальные внешние отступы обнуляем — позицию задаёт top
      const clone = el.cloneNode(true) as HTMLElement;
      clone.style.marginTop = "0";
      clone.style.marginBottom = "0";
      (buckets[page] ||= []).push(
        `<div style="position:absolute;left:${marginLeft}px;top:${localTop}px;width:${contentWidth}px;box-sizing:border-box;">${clone.outerHTML}</div>`,
      );
    });
    const pages: string[] = [];
    for (let i = 0; i < buckets.length; i++)
      pages.push((buckets[i] || []).join(""));
    return pages.length ? pages : [""];
  }, [PAGE_WIDTH, marginLeft, marginRight, PAGE_PAD_V, PAGE_STRIDE]);

  // Позиция вшитого штампа ЭЦП относительно своей страницы (для печати).
  const getEmbeddedStampInfo = useCallback(() => {
    const editor = editorRef.current;
    const stamp = editor?.querySelector<HTMLElement>(`[${STAMP_ATTR}]`);
    if (!stamp) return null;
    const x = parseFloat(stamp.style.left) || 0;
    const top = parseFloat(stamp.style.top) || 0;
    const pageIndex = Math.max(0, Math.floor(top / PAGE_STRIDE));
    return {
      pageIndex,
      x,
      y: top - pageIndex * PAGE_STRIDE,
      width: stamp.style.width || "377px",
      html: stamp.innerHTML,
    };
  }, [PAGE_STRIDE]);

  // Штамп ЭЦП для предпросмотра: уже вшитый рисунок ИЛИ плавающий плейсхолдер до
  // подписания. Считаем из той же live-DOM, что и страницы, — поэтому штамп в
  // предпросмотре всегда совпадает со страницей холста.
  const getPreviewStamp = useCallback(():
    | { pageIndex: number; x: number; y: number; width: string; html?: string }
    | null => {
    const embedded = getEmbeddedStampInfo();
    if (embedded) return embedded;
    if (stampVisible && finalSigner?.dsApplied) {
      const pageIndex = Math.max(0, Math.floor(stampPos.y / PAGE_STRIDE));
      return {
        pageIndex,
        x: stampPos.x,
        y: stampPos.y - pageIndex * PAGE_STRIDE,
        width:
          typeof stampSize.width === "number"
            ? `${stampSize.width}px`
            : stampSize.width,
      };
    }
    return null;
  }, [
    getEmbeddedStampInfo,
    stampVisible,
    finalSigner,
    stampPos,
    stampSize,
    PAGE_STRIDE,
  ]);

  // Дополняем массив страниц пустыми, чтобы страница со штампом существовала,
  // даже если на ней нет текстовых блоков.
  const padPagesForStamp = (
    pages: string[],
    stamp: { pageIndex: number } | null,
  ) => {
    if (stamp) while (pages.length <= stamp.pageIndex) pages.push("");
    return pages;
  };

  // CSS, дублирующий оформление холста редактора (классы Tailwind редактора в
  // iframe печати недоступны) — чтобы напечатанное совпадало с холстом 1-в-1.
  const printPageCss = (isLand: boolean) => {
    const pageW = isLand ? PAGE_HEIGHT : PAGE_WIDTH;
    const pageH = isLand ? PAGE_WIDTH : PAGE_HEIGHT;
    return `
  @page { size: A4 ${isLand ? "landscape" : "portrait"}; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", serif; font-size: ${fontSize}px; line-height: 1.8; color: #1e293b; }
  /* Лист печати = холст редактора 1-в-1 (96 DPI). Блоки внутри спозиционированы
     абсолютно по их реальным координатам из редактора. */
  .page {
    position: relative;
    width: ${pageW}px; height: ${pageH}px;
    overflow: hidden;
    break-after: page; page-break-after: always;
  }
  .page:last-child { break-after: auto; page-break-after: auto; }
  .page * { max-width: 100%; white-space: pre-wrap; overflow-wrap: break-word; word-break: break-word; }
  .page div[data-signature-stamp] * { white-space: normal; }
  img { max-width: 100%; height: auto; }
  table { width: 100%; table-layout: auto; border-collapse: collapse; }
  td, th { border: 1px solid #cbd5e1; padding: 4px 8px; vertical-align: top; word-break: break-word; }
  ul { list-style: disc; padding-left: 1.5em; }
  ol { list-style: decimal; padding-left: 1.5em; }
  [data-page-spacer] { display: none !important; }`;
  };

  const handlePrint = () => {
    const isLand = orientation === "landscape";
    const stamp = getEmbeddedStampInfo();
    const pages = padPagesForStamp(getEditorPages(), stamp);

    const pagesHtml = pages
      .map((html, idx) => {
        const stampHtml =
          stamp && stamp.pageIndex === idx
            ? `<div style="position:absolute;left:${marginLeft + stamp.x}px;top:${PAGE_PAD_V + stamp.y}px;width:${stamp.width};overflow:hidden;pointer-events:none;">${stamp.html}</div>`
            : "";
        return `<div class="page">${html}${stampHtml}</div>`;
      })
      .join("");

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const win = iframe.contentWindow;
    const doc = iframe.contentWindow?.document;
    if (!win || !doc) {
      iframe.remove();
      return;
    }

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<title></title>
<style>${printPageCss(isLand)}</style>
</head>
<body>${pagesHtml}</body>
</html>`);
    doc.close();

    const triggerPrint = () => {
      win.focus();
      win.print();
      setTimeout(() => iframe.remove(), 1000);
    };
    if (doc.readyState === "complete") {
      setTimeout(triggerPrint, 300);
    } else {
      win.onload = () => setTimeout(triggerPrint, 300);
    }
  };

  const onSaveClick = async () => {
    const editorBody = editorContent || getCleanEditorHtml();

    const requestPayload: any = {
      subject,
      body: editorBody,
      recipients: {
        to: to.map((r) => r.id),
        cc: cc.map((r) => r.id),
      },
      approvals: approvers.map((a) => a.id),
      signatures: finalSigner ? [finalSigner.id] : [],
      folder_id: typeof folder === "number" ? folder : undefined,
      system_folder: typeof folder === "string" ? folder : undefined,
      document_type: letterType,
      priority: importance,
    };

    // source_correspondence_id и link_type передаём только вместе.
    if (sourceCorrespondenceId != null && linkType) {
      requestPayload.source_correspondence_id = Number(sourceCorrespondenceId);
      requestPayload.link_type = linkType;
    }

    saveDraft(requestPayload);
  };

  useEffect(() => {
    if (!id && location.state) {
      if (location.state.subject && !subject) {
        setSubject(location.state.subject);
      }
      if (location.state.body && !editorContent) {
        setEditorContent(location.state.body);
        if (editorRef.current) {
          editorRef.current.innerHTML = location.state.body;
        }
      }
    }
  }, [id, location.state]);

  useEffect(() => {
    if (initialData?.item) {
      const item = initialData.item;

      if (item.subject) setSubject(item.subject);

      // ВАЖНО: тело письма в редактор грузит ТОЛЬКО эффект истории версий
      // (по allVersions). Если дублировать загрузку здесь, этот эффект
      // срабатывает после пагинации и перезаписывает innerHTML, стирая
      // распорки между страницами — текст «сползает» в зазор после обновления.

      // priority и document_type приходят уже в ключах бэкенда — кладём как есть
      if (item.priority) setImportance(item.priority);
      if (item.document_type) setLetterType(item.document_type);

      if (item.recipients && Array.isArray(item.recipients)) {
        const toUsers: RecipientOption[] = [];
        const ccUsers: RecipientOption[] = [];
        item.recipients.forEach((r: any) => {
          if (!r.user) return;
          const mappedUser = {
            id: String(r.user.id),
            name: r.user.full_name,
            org: r.user.position || r.user.department || "Сотрудник",
            initials: r.user.full_name
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join(""),
            color: "bg-blue-100 text-blue-700",
          };
          if (r.type === "to") toUsers.push(mappedUser);
          if (r.type === "cc") ccUsers.push(mappedUser);
        });
        if (toUsers.length > 0) setTo(toUsers);
        if (ccUsers.length > 0) {
          setCc(ccUsers);
          setShowCcField(true);
        }
      }

      if (item.approvals && Array.isArray(item.approvals)) {
        setApprovers(
          item.approvals.map((a: any) => {
            const userData = a.approver || a.user;

            return {
              id: String(userData?.id),
              approvalRecordId: String(a.id),
              isInvited: true,
              name: userData?.full_name || "Неизвестно",
              role: userData?.position || "Сотрудник",
              initials: userData?.full_name
                ? userData.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")
                : "",
              color: "bg-slate-100 text-slate-700",
              approved: a.status === "approved",
              approving: false,
              comment: a.note || "",
              showCommentInput: false,
              dsApplied: a.status === "approved",
              dsLoading: false,
              status: a.status,
              note: a.note || null,
              decided_at: a.decided_at || null,
            };
          }),
        );
      }

      // Уже сохранённые вложения. Файлы, выбранные пользователем прямо сейчас,
      // оставляем: письмо перезапрашивается и после посторонних действий,
      // и такой рефетч не должен съедать несохранённый выбор.
      if (Array.isArray(item.attachments)) {
        setAttachments((prev) => [
          ...item.attachments.map((a: any) => mapServerAttachment(a, item.id || id)),
          ...prev.filter((a) => a.file),
        ]);
      }

      if (item.creator) {
        setDocCreator(item.creator);
      }

      if (item.signatures && item.signatures.length > 0) {
        const activeSigs = item.signatures.filter((s: any) => s.status !== "revoked");
        const s = activeSigs.length > 0 ? activeSigs[activeSigs.length - 1] : item.signatures[item.signatures.length - 1];
        const isCurrentlySigned = s.status === "signed";
        const isCurrentlyDeclined = s.status === "declined";
        setFinalSigner({
          id: String(s.user.id),
          isInvited: true,
          name: s.user.full_name,
          role: s.user.position || "Сотрудник",
          initials: s.user.full_name
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join(""),
          color: "bg-purple-100 text-purple-700",
          dsApplied: isCurrentlySigned,
          dsDeclined: isCurrentlyDeclined,
          declineReason: s.decline_reason || s.reason,
          dsLoading: false,
        });
        if (isCurrentlySigned) {
          setStampVisible(false);
        }
      } else if (item.creator) {

        setFinalSigner({
          id: String(item.creator.id),
          isInvited: false,
          name: item.creator.full_name,
          role: item.creator.position || "Автор документа",
          initials: item.creator.full_name
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join(""),
          color: "bg-purple-100 text-purple-700",
          dsApplied: false,
          dsLoading: false,
        });
      }
    }
  }, [initialData]);

  // Предзаполнение при «Ответить»/«Перенаправить» (один раз при монтировании).
  // Ответить → тема «Ответ: …», «Кому» = отправитель входящего письма.
  // Перенаправить → тема «Перенаправление: …», «Кому» остаётся пустым.
  useEffect(() => {
    if (composeAppliedRef.current) return;
    if (!composeMode || !sourceLetter) return;
    composeAppliedRef.current = true;

    setSubject(
      `${composeMode === "reply" ? "Ответ" : "Перенаправление"}: ${
        sourceLetter.subject || ""
      }`,
    );

    if (composeMode === "reply" && sourceLetter.creator?.id != null) {
      const c = sourceLetter.creator;
      const initials = (c.full_name || "")
        .split(/\s+/)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      setTo([
        {
          id: String(c.id),
          name: c.full_name || "",
          org: c.position || c.department || "Сотрудник",
          initials,
          color: "bg-blue-100 text-blue-700",
        },
      ]);
    }
  }, [composeMode, sourceLetter]);

  useEffect(() => {
    if (rawWorkflowData?.data) {
      const wfApprovals = rawWorkflowData.data.approvals || [];
      const wfSignatures = rawWorkflowData.data.signatures || [];

      if (wfApprovals.length > 0) {
        setApprovers((prev) => {
          const merged = [...prev];
          wfApprovals.forEach((wfA: any) => {
            const user = wfA.approver || wfA.user;
            if (!user) return;
            const existingIdx = merged.findIndex(
              (a) => a.id === String(user.id),
            );
            if (existingIdx !== -1) {
              merged[existingIdx] = {
                ...merged[existingIdx],
                approvalRecordId: String(wfA.id),
                isInvited: true,
                approved: wfA.status === "approved",
                dsApplied: wfA.status === "approved",
              };
            } else {
              merged.push({
                id: String(user.id),
                approvalRecordId: String(wfA.id),
                isInvited: true,
                name: user.full_name,
                role: user.position || "Сотрудник",
                initials: user.full_name
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join(""),
                color: "bg-slate-100 text-slate-700",
                approved: wfA.status === "approved",
                approving: false,
                comment: "",
                showCommentInput: false,
                dsApplied: wfA.status === "approved",
                dsLoading: false,
              });
            }
          });
          return merged;
        });
      }

      if (wfSignatures.length > 0) {
        const activeSigs = wfSignatures.filter((s: any) => s.status !== "revoked");
        const wfS = activeSigs.length > 0 ? activeSigs[activeSigs.length - 1] : wfSignatures[wfSignatures.length - 1];
        const user = wfS.user;
        const isCurrentlySigned = wfS.status === "signed";
        const isCurrentlyDeclined = wfS.status === "declined";

        if (user) {
          setFinalSigner({
            id: String(user.id),
            isInvited: true,
            name: user.full_name,
            role: user.position || "Сотрудник",
            initials: user.full_name
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join(""),
            color: "bg-purple-100 text-purple-700",
            dsApplied: isCurrentlySigned,
            dsDeclined: isCurrentlyDeclined,
            declineReason: wfS.decline_reason || wfS.reason,
            dsLoading: false,
          });
          if (isCurrentlySigned) {
            setStampVisible(false);
          }
        }
      }
    }
  }, [rawWorkflowData]);

  const handleFontSize = (size: string) => {
    setShowFontSizeDropdown(false);
    const editor = editorRef.current;
    // Подписанный документ / старая версия — размер шрифта менять нельзя.
    if (!editor || !editor.isContentEditable) return;
    // Набор до смены размера — отдельный шаг истории изменений.
    commitHistoryNow();
    editor.focus();

    // Точный размер для выделенного текста. execCommand("fontSize") умеет
    // только 7 ступеней HTML (small/large/…): 13/14 давали одинаковые 16px, а
    // «16» реально печатала 18px — измерения пагинации расходились с ожидаемым.
    // Ставим ступень-маркер 7, затем переписываем её на точный px-размер.
    const sel = window.getSelection();
    const hasRangeSelection =
      !!sel &&
      sel.rangeCount > 0 &&
      !sel.isCollapsed &&
      editor.contains(sel.anchorNode);
    // Есть выделение → меняем размер ТОЛЬКО выделенного фрагмента (inline-span),
    // базовый размер листа НЕ трогаем (иначе перекрасился бы весь текст).
    // Нет выделения → меняем базовый размер всего листа.
    if (!hasRangeSelection) {
      setFontSize(size);
      return;
    }

    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("fontSize", false, "7");
    editor
      .querySelectorAll<HTMLElement>('span[style*="font-size"]')
      .forEach((s) => {
        const fs = s.style.fontSize;
        if (fs === "xxx-large" || fs === "-webkit-xxx-large") {
          s.style.fontSize = `${size}px`;
        }
      });
    // Fallback: некоторые движки вместо span со стилем вставляют <font size="7">
    editor.querySelectorAll<HTMLElement>('font[size="7"]').forEach((f) => {
      const span = document.createElement("span");
      span.style.fontSize = `${size}px`;
      while (f.firstChild) span.appendChild(f.firstChild);
      f.replaceWith(span);
    });

    // Немедленная перепагинация с новым размером — без ожидания rAF-цепочки.
    syncEditorAfterDomEdit();
  };

  // HTML без служебных артефактов (распорки/разрезы) — для сохранения и превью
  const getCleanEditorHtml = useCallback(() => {
    const el = editorRef.current;
    if (!el) return "<p></p>";
    return cleanEditorArtifacts(el.innerHTML) || "<p></p>";
  }, []);

  // Постраничная разбивка редактора. Абзац, не влезающий до конца страницы,
  // делится: влезающие строки остаются, хвост уезжает за распорку на следующий
  // лист (с сохранением разметки; части склеиваются при сохранении). Списки
  // делятся по пунктам, таблицы — по строкам, атомарные блоки переносятся
  // целиком. Курсор сохраняется структурно + сверяется по смещению в символах.
  const paginateEditor = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return 1;

    // --- Функция структурного сохранения курсора ---
    const saveCaretStructure = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editor.contains(sel.anchorNode))
        return null;

      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      const offset = range.startOffset;

      if (node === editor) {
        return { blockIndex: 0, path: [], offset: 0 };
      }

      // Находим родительский блок верхнего уровня (прямой потомок editor)
      let topBlock = node;
      while (topBlock && topBlock.parentNode !== editor) {
        topBlock = topBlock.parentNode!;
      }
      if (!topBlock) return null;
      // «Голый» текстовый узел верхнего уровня (например, сразу после вставки
      // plain-text): структурный путь не работает — editor.children содержит
      // только элементы, и индекс блока посчитался бы неверно. Позицию
      // восстановит символьный fallback (getCaretCharOffset) ниже.
      if (topBlock.nodeType !== Node.ELEMENT_NODE) return null;

      // Считаем индекс этого блока среди всех детей, игнорируя распорки spacer
      const children = Array.from(editor.children);
      let blockIndex = 0;
      for (const child of children) {
        if (child === topBlock) break;
        if (!child.hasAttribute(SPACER_ATTR)) {
          blockIndex++;
        }
      }

      // Запоминаем путь от topBlock до целевого узла (node)
      const path: number[] = [];
      let current = node;
      while (current !== topBlock) {
        const parent = current.parentNode;
        if (!parent) break;
        const index = Array.from(parent.childNodes).indexOf(
          current as ChildNode,
        );
        path.unshift(index);
        current = parent;
      }

      return { blockIndex, path, offset };
    };

    // --- Функция структурного восстановления курсора ---
    const restoreCaretStructure = (snapshot: any) => {
      if (!snapshot) return;

      const children = Array.from(editor.children);
      let currentBlock: Element | null = null;
      let nonSpacerCount = 0;

      // Ищем блок по индексу, пропуская сервисные распорки spacers
      for (const child of children) {
        if (child.hasAttribute(SPACER_ATTR)) continue;
        if (nonSpacerCount === snapshot.blockIndex) {
          currentBlock = child;
          break;
        }
        nonSpacerCount++;
      }

      if (!currentBlock) {
        const validBlocks = children.filter(
          (c) => !c.hasAttribute(SPACER_ATTR),
        );
        currentBlock = validBlocks[validBlocks.length - 1] || editor;
      }

      // Спускаемся по сохраненному пути дерева DOM к нужному узлу
      let targetNode: Node = currentBlock;
      for (const idx of snapshot.path) {
        if (targetNode.childNodes[idx]) {
          targetNode = targetNode.childNodes[idx];
        } else {
          targetNode = targetNode.lastChild || targetNode;
          break;
        }
      }

      try {
        const range = document.createRange();
        const maxOffset =
          targetNode.nodeType === Node.TEXT_NODE
            ? targetNode.textContent?.length || 0
            : targetNode.childNodes.length;

        range.setStart(targetNode, Math.min(snapshot.offset, maxOffset));
        range.collapse(true);

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (e) {
        console.error("Ошибка восстановления каретки:", e);
      }
    };

    // Сохраняем положение курсора через структуру
    const caretSnapshot = saveCaretStructure();
    // Эталонный символьный снимок: пагинация переставляет/режет/клеит блоки,
    // НЕ меняя сам текст, поэтому абсолютное смещение в символах инвариантно.
    // Структурный снимок точнее в пустых блоках, но ломается, когда блоки
    // сливаются/разрезаются (сдвигаются индексы) — тогда после структурного
    // восстановления позиция сверяется по символам и чинится fallback'ом.
    const caretChars = getCaretCharOffset(editor);
    const restoreCaretHybrid = () => {
      restoreCaretStructure(caretSnapshot);
      if (caretChars) {
        const after = getCaretCharOffset(editor);
        if (!after || after.offset !== caretChars.offset) {
          restoreCaretCharOffset(editor, caretChars);
        }
      }
    };
    let textMutated = false;

    // 1. Убираем старые распорки и собираем ранее разрезанные блоки обратно
    editor.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => {
      if (removeSpacerSafely(n)) textMutated = true;
    });

    const groups = new Map<string, HTMLElement[]>();
    editor
      .querySelectorAll<HTMLElement>(`[${AUTOSPLIT_ATTR}]`)
      .forEach((el) => {
        const gid = el.getAttribute(AUTOSPLIT_ATTR) || "";
        const arr = groups.get(gid) || [];
        arr.push(el);
        groups.set(gid, arr);
      });
    groups.forEach((pieces) => {
      const first = pieces[0];
      first.removeAttribute(AUTOSPLIT_ATTR);
      for (let k = 1; k < pieces.length; k++) {
        let child = pieces[k].firstChild;
        while (child) {
          first.appendChild(child);
          child = pieces[k].firstChild;
        }
        pieces[k].remove();
      }
      first.normalize();
      textMutated = true;
    });

    // Контент помещается на один лист и нет ручных разрывов
    if (
      editor.scrollHeight <= CONTENT_HEIGHT &&
      !editor.querySelector(`[${PAGE_BREAK_ATTR}]`)
    ) {
      if (textMutated) restoreCaretHybrid();
      lastPaginatedHeightRef.current = editor.scrollHeight;
      return 1;
    }

    // 2. «Голый» текст и инлайн-узлы заворачиваем в блок <p>
    let buf: Node[] = [];
    const flushBuf = () => {
      if (!buf.length) return;
      const div = document.createElement("p");
      buf[0].parentNode?.insertBefore(div, buf[0]);
      buf.forEach((n) => div.appendChild(n));
      buf = [];
      textMutated = true;
    };
    Array.from(editor.childNodes).forEach((node) => {
      const isBlock =
        node.nodeType === Node.ELEMENT_NODE &&
        EDITOR_BLOCK_TAGS.has((node as HTMLElement).tagName);
      if (isBlock) flushBuf();
      else buf.push(node);
    });
    flushBuf();

    const makeSpacer = (h: number) => {
      const s = document.createElement("div");
      s.setAttribute(SPACER_ATTR, "1");
      s.setAttribute("contenteditable", "false");
      s.setAttribute("aria-hidden", "true");
      s.style.height = `${Math.max(0, h)}px`;
      s.style.width = "100%";
      s.style.userSelect = "none";
      s.style.pointerEvents = "none";
      return s;
    };

    // Таблицы — атомарные блоки: их нельзя резать по символам, как абзац.
    // Поэтому таблицу, не помещающуюся на лист, делим по СТРОКАМ: строки, что
    // не влезают до конца страницы, переезжают в таблицу-продолжение (со всеми
    // стилями исходной), между ними ставится распорка. Обе части помечаются
    // AUTOSPLIT_ATTR — при сохранении cleanEditorArtifacts склеит их в одну
    // таблицу. Без этого высокая таблица «перетекала» через границы листов.
    const splitTableByRows = (
      table: HTMLElement,
      usableBottom: number,
      page: number,
      pageStart: number,
    ): boolean => {
      const rows = Array.from(table.querySelectorAll("tr")).filter(
        (tr) => tr.closest("table") === table,
      ) as HTMLElement[];
      if (rows.length < 2) return false;

      // offsetTop у <tr> в разных движках считается относительно <table>, а не
      // редактора — полагаться на него нельзя. Меряем строки через rect и
      // приводим к системе координат редактора (как у table.offsetTop).
      const tableRectTop = table.getBoundingClientRect().top;
      const tableOffsetTop = table.offsetTop;
      const rowBottom = (tr: HTMLElement) => {
        const r = tr.getBoundingClientRect();
        return r.bottom - tableRectTop + tableOffsetTop;
      };

      const splitIdx = rows.findIndex((tr) => rowBottom(tr) > usableBottom + 1);
      if (splitIdx === -1) return false;

      // Даже первая строка не влезает в остаток листа — переносим таблицу
      // целиком на следующую страницу (там доступна полная высота листа).
      if (splitIdx === 0) {
        if (table.offsetTop > pageStart + 2) {
          editor.insertBefore(
            makeSpacer((page + 1) * PAGE_STRIDE - table.offsetTop),
            table,
          );
          return true;
        }
        return false; // одна строка выше целого листа — делить нечем
      }

      const gid = table.getAttribute(AUTOSPLIT_ATTR) || `g${++splitGroupSeq}`;
      table.setAttribute(AUTOSPLIT_ATTR, gid);

      const tail = document.createElement("table");
      Array.from(table.attributes).forEach((a) =>
        tail.setAttribute(a.name, a.value),
      );
      const tbody = document.createElement("tbody");
      tail.appendChild(tbody);
      for (let k = splitIdx; k < rows.length; k++) tbody.appendChild(rows[k]);

      // Убираем опустевшие группы строк, чтобы они не копились при повторных
      // слияниях/разрезаниях на каждой пагинации.
      table.querySelectorAll("tbody, thead, tfoot").forEach((g) => {
        if (g.closest("table") === table && !g.querySelector("tr")) g.remove();
      });

      editor.insertBefore(tail, table.nextSibling);
      const blockBottom = table.offsetTop + table.offsetHeight;
      editor.insertBefore(makeSpacer((page + 1) * PAGE_STRIDE - blockBottom), tail);
      return true;
    };

    // Списки (UL/OL) делим по пунктам <li>, как таблицы по строкам: пункты, не
    // влезшие до конца страницы, переезжают в список-продолжение с теми же
    // атрибутами. Обе части — в одной AUTOSPLIT-группе, при сохранении
    // склеиваются обратно в один список. Раньше высокий список резался
    // посимвольно через textContent и терял всю структуру пунктов.
    const splitListByItems = (
      list: HTMLElement,
      usableBottom: number,
      page: number,
      pageStart: number,
    ): boolean => {
      const items = Array.from(list.children).filter(
        (n): n is HTMLElement => n.tagName === "LI",
      );

      const moveWholeToNextPage = (): boolean => {
        if (list.offsetTop > pageStart + 2) {
          editor.insertBefore(
            makeSpacer((page + 1) * PAGE_STRIDE - list.offsetTop),
            list,
          );
          return true;
        }
        return false;
      };

      if (items.length < 2) return moveWholeToNextPage();

      // offsetTop у <li> считается относительно списка — меряем через rect и
      // приводим к системе координат редактора (как у list.offsetTop).
      const listRectTop = list.getBoundingClientRect().top;
      const listOffsetTop = list.offsetTop;
      const itemBottom = (li: HTMLElement) =>
        li.getBoundingClientRect().bottom - listRectTop + listOffsetTop;

      const splitIdx = items.findIndex(
        (li) => itemBottom(li) > usableBottom + 1,
      );
      if (splitIdx === -1) return false;
      // Даже первый пункт не влезает в остаток листа — переносим целиком.
      if (splitIdx === 0) return moveWholeToNextPage();

      const gid = list.getAttribute(AUTOSPLIT_ATTR) || `g${++splitGroupSeq}`;
      list.setAttribute(AUTOSPLIT_ATTR, gid);

      const tail = list.cloneNode(false) as HTMLElement;
      // Нумерация продолжения OL продолжает исходную, а не начинается с 1.
      if (list.tagName === "OL") {
        const startBase = parseInt(list.getAttribute("start") || "1", 10);
        tail.setAttribute("start", String(startBase + splitIdx));
      }
      for (let k = splitIdx; k < items.length; k++) tail.appendChild(items[k]);

      editor.insertBefore(tail, list.nextSibling);
      const blockBottom = list.offsetTop + list.offsetHeight;
      editor.insertBefore(
        makeSpacer((page + 1) * PAGE_STRIDE - blockBottom),
        tail,
      );
      return true;
    };

    // Деление абзаца по вертикальному бюджету (остатку места на текущей
    // странице) с СОХРАНЕНИЕМ разметки: голова остаётся на месте, хвост уезжает
    // за распорку на следующий лист. Обе части — в одной AUTOSPLIT-группе и при
    // сохранении склеиваются обратно. Так текст перетекает между страницами
    // построчно, как в Word, без больших пустых областей внизу листа. Возвращает
    // false, если в бюджет не влезает ни одной строки.
    const splitBlockToBudget = (
      block: HTMLElement,
      budgetPx: number,
      page: number,
    ): boolean => {
      const total = (block.textContent || "").length;
      if (total < 2 || budgetPx <= 0) return false;

      const template = block.cloneNode(true) as HTMLElement;
      const originalHtml = block.innerHTML;

      const headHtmlFor = (k: number): string => {
        const probe = template.cloneNode(true) as HTMLElement;
        truncateToChars(probe, { left: k });
        return probe.innerHTML;
      };

      // Бинарный поиск числа символов, влезающих в остаток страницы. Меряем на
      // живом блоке (та же ширина/шрифт/позиция), подменяя содержимое.
      let lo = 1;
      let hi = total - 1;
      let best = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        block.innerHTML = headHtmlFor(mid);
        if (block.offsetHeight <= budgetPx) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      if (best < 1) {
        block.innerHTML = originalHtml;
        return false;
      }

      const tail = template.cloneNode(true) as HTMLElement;
      dropChars(tail, { left: best });
      // <br> ровно на границе разреза принадлежит голове (там он невидим);
      // в хвосте он дал бы лишнюю пустую строку в начале страницы.
      if (brAtCharBoundary(template, best)) removeLeadingBr(tail);
      if (!(tail.textContent || "").trim() && !tail.querySelector("br,img")) {
        // Хвост пуст — деление не имеет смысла.
        block.innerHTML = originalHtml;
        return false;
      }

      block.innerHTML = headHtmlFor(best);

      const gid = block.getAttribute(AUTOSPLIT_ATTR) || `g${++splitGroupSeq}`;
      block.setAttribute(AUTOSPLIT_ATTR, gid);
      tail.setAttribute(AUTOSPLIT_ATTR, gid);

      editor.insertBefore(tail, block.nextSibling);
      const blockBottom = block.offsetTop + block.offsetHeight;
      editor.insertBefore(
        makeSpacer((page + 1) * PAGE_STRIDE - blockBottom),
        tail,
      );
      return true;
    };

    // 3. Раскладка по страницам
    let i = 0;
    let guard = 0;
    while (i < editor.children.length && guard < 8000) {
      guard++;
      const block = editor.children[i] as HTMLElement;
      if (block.hasAttribute(SPACER_ATTR)) {
        i++;
        continue;
      }
      if (block.hasAttribute(PAGE_BREAK_ATTR)) {
        const top = block.offsetTop;
        const page = Math.floor(top / PAGE_STRIDE);
        editor.insertBefore(
          makeSpacer((page + 1) * PAGE_STRIDE - top),
          block.nextSibling,
        );
        i += 2;
        continue;
      }
      if (
        block.hasAttribute("data-signature-stamp") ||
        getComputedStyle(block).position === "absolute"
      ) {
        i++;
        continue;
      }
      const top = block.offsetTop;
      const h = block.offsetHeight;
      const page = Math.floor(top / PAGE_STRIDE);
      const pageStart = page * PAGE_STRIDE;
      const usableBottom = pageStart + CONTENT_HEIGHT;
      const overflows = top >= usableBottom || top + h > usableBottom;

      if (!overflows) {
        i++;
        continue;
      }

      const tag = block.tagName;

      // Таблицы паджинируем по строкам (атомарны для посимвольного деления).
      if (tag === "TABLE") {
        // Влезает в лист целиком, но не до конца текущей страницы — переносим.
        if (h <= CONTENT_HEIGHT && top > pageStart + 2) {
          editor.insertBefore(
            makeSpacer((page + 1) * PAGE_STRIDE - top),
            block,
          );
          i++;
          continue;
        }
        // Выше печатной области листа — режем по строкам.
        if (splitTableByRows(block, usableBottom, page, pageStart)) {
          textMutated = true;
        }
        i++;
        continue;
      }

      // Списки делим по пунктам: часть остаётся, хвост уезжает на новый лист.
      if (tag === "UL" || tag === "OL") {
        if (splitListByItems(block, usableBottom, page, pageStart)) {
          textMutated = true;
        }
        i++;
        continue;
      }

      // Блок начинается уже за печатной областью (в зазоре между листами) —
      // сдвигаем его на начало следующей страницы.
      if (top >= usableBottom) {
        editor.insertBefore(makeSpacer((page + 1) * PAGE_STRIDE - top), block);
        i++;
        continue;
      }

      const splittable =
        PAGE_SPLITTABLE_TAGS.has(tag) &&
        !EDITOR_ATOMIC_TAGS.has(tag) &&
        (block.textContent || "").trim().length > 0;

      // Пробуем отрезать влезающую часть блока в остаток текущей страницы:
      // абзац перетекает на следующий лист построчно, как в Word. Раньше блок
      // выше страницы целиком уезжал на следующий лист, оставляя предыдущую
      // страницу почти пустой (например, после смены размера шрифта).
      if (splittable && splitBlockToBudget(block, usableBottom - top, page)) {
        textMutated = true;
        i++;
        continue;
      }

      // Не делится (атомарный, пустой, или в остаток не влезает ни строки) —
      // переносим целиком на следующую страницу.
      if (top > pageStart + 2) {
        editor.insertBefore(makeSpacer((page + 1) * PAGE_STRIDE - top), block);
        i++;
        continue;
      }

      i++;
    }

    // Восстанавливаем позицию курсора: структурно + сверка по символам
    if (textMutated || caretSnapshot || caretChars) {
      restoreCaretHybrid();
    }

    lastPaginatedHeightRef.current = editor.scrollHeight;
    return Math.max(1, Math.ceil(editor.scrollHeight / PAGE_STRIDE));
  }, [CONTENT_HEIGHT, PAGE_STRIDE]);
  paginateEditorRef.current = paginateEditor;

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

  // Подсветка активных кнопок тулбара: какие форматы применены к текущему
  // выделению/каретке. Обновляется по selectionchange и после execCmd.
  const [activeFmt, setActiveFmt] = useState<Record<string, boolean>>({});
  const refreshActiveFmt = useCallback(() => {
    const editor = editorRef.current;
    const sel = window.getSelection();
    // Выделение вне редактора (или редактор readonly) — гасим всю подсветку.
    if (
      !editor ||
      !editor.isContentEditable ||
      !sel ||
      sel.rangeCount === 0 ||
      !editor.contains(sel.anchorNode)
    ) {
      setActiveFmt((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }
    const q = (cmd: string) => {
      try {
        return document.queryCommandState(cmd);
      } catch {
        return false;
      }
    };
    let block = "";
    try {
      block = (document.queryCommandValue("formatBlock") || "").toLowerCase();
    } catch {
      block = "";
    }
    const next: Record<string, boolean> = {
      bold: q("bold"),
      italic: q("italic"),
      underline: q("underline"),
      strikeThrough: q("strikeThrough"),
      justifyLeft: q("justifyLeft"),
      justifyCenter: q("justifyCenter"),
      justifyRight: q("justifyRight"),
      justifyFull: q("justifyFull"),
      insertUnorderedList: q("insertUnorderedList"),
      insertOrderedList: q("insertOrderedList"),
      h1: block === "h1",
      h2: block === "h2",
    };
    // Меняем стейт только при реальном отличии — selectionchange частит.
    setActiveFmt((prev) => {
      const keys = Object.keys(next);
      const same =
        keys.length === Object.keys(prev).length &&
        keys.every((k) => prev[k] === next[k]);
      return same ? prev : next;
    });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActiveFmt);
    return () =>
      document.removeEventListener("selectionchange", refreshActiveFmt);
  }, [refreshActiveFmt]);

  // Команды форматирования тулбара. Нативные undo/redo сюда не ходят —
  // история изменений собственная (undoEdit/redoEdit).
  const execCmd = useCallback(
    (command: string, value?: string) => {
      const editor = editorRef.current;
      // contentEditable=false — режим «только чтение» (подписано / старая
      // версия): команды форматирования заблокированы.
      if (!editor || !editor.isContentEditable) return;
      // Незакоммиченный набор — отдельный шаг истории, форматирование — свой.
      commitHistoryNow();
      editor.focus();
      document.execCommand(command, false, value);
      commitHistoryNow();
      // Тулбар-переключение (bold/список/выравнивание) часто НЕ двигает
      // выделение → событие selectionchange не сработает. Обновляем подсветку
      // кнопок вручную сразу после команды.
      refreshActiveFmt();
    },
    [commitHistoryNow, refreshActiveFmt],
  );

  const handleEditorInput = useCallback(
    (e?: React.FormEvent<HTMLDivElement>) => {
    const native = e?.nativeEvent as InputEvent | undefined;
    const inputType = native?.inputType || "";
    const data = native?.data ?? "";
    const isParaBoundary =
      inputType === "insertParagraph" || inputType === "insertLineBreak";

    const editor = editorRef.current;
    if (editor) {
      // Документ очищен полностью: браузер оставляет пустые обёртки с прежним
      // оформлением (<strong>, text-align и т.п.), из-за чего новый текст
      // печатается жирным/со старым выравниванием. Сбрасываем к чистому блоку.
      // Важно: пусто == НЕТ символов вообще (length 0), а не «только пробелы».
      // trim() считал пустыми пробел/табуляцию и стирал их — из-за этого Space
      // в пустом редакторе не срабатывал, а Tab+Space «съедал» табуляцию.
      // НО: Enter/Shift+Enter в пустом холсте создаёт вторую пустую строку
      // (<p><br></p>×2) — тоже textContent="", и сброс схлопывал бы её обратно,
      // из-за чего Enter «не работал» на пустом документе. Для вставки абзаца/
      // переноса сброс не делаем.
      const isEmpty =
        !editor.textContent?.length && !editor.querySelector("img,table,hr");
      if (isEmpty && !isParaBoundary && editor.innerHTML !== "<p><br></p>") {
        editor.innerHTML = "<p><br></p>";
        const sel = window.getSelection();
        const range = document.createRange();
        range.setStart(editor.firstChild as Node, 0);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
    setEditorContent(getCleanEditorHtml());

    // Гранулярность отмены как в Word: обычный набор складывается в один шаг по
    // паузам (scheduleHistoryCommit), но граница слова/абзаца немедленно фиксирует
    // набранное — тогда Ctrl+Z откатывает по словам, а не всю фразу целиком.
    // Enter/Shift+Enter (insertParagraph/insertLineBreak) — тоже граница шага.
    const isWordBoundary =
      inputType === "insertText" && !!data && WORD_BOUNDARY_RE.test(data);
    if (isWordBoundary || isParaBoundary) {
      commitHistoryNow();
    } else {
      // Набор текста складывается в шаги истории по паузам.
      scheduleHistoryCommit();
    }
    },
    [getCleanEditorHtml, scheduleHistoryCommit, commitHistoryNow],
  );

  // После ручной правки DOM (слияние через границу, вставка разрыва) сразу
  // перепагинируем синхронно — не дожидаясь rAF-эффекта — и синхронизируем стейт.
  // Важно: setEditorContent может не измениться (clean-HTML тот же), поэтому
  // одной подписки на editorContent здесь недостаточно.
  const syncEditorAfterDomEdit = useCallback(() => {
    setPageCount(paginateEditor());
    setEditorContent(getCleanEditorHtml());
    // Дискретная правка DOM — сразу отдельный шаг истории изменений.
    commitHistoryNow();
  }, [paginateEditor, getCleanEditorHtml, commitHistoryNow]);

  // Tab — выделяемый табулятор (прогон неразрывных пробелов). Backspace/Delete на
  // границе страниц — управляемое слияние блоков: дефолтное поведение браузера
  // рядом с contenteditable=false распоркой прыгает курсором и теряет текст.
  const handleEditorKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z — только собственная история. Нативную
      // отмену браузера глушим всегда: её стек разрушен программными правками
      // пагинации и восстанавливает непредсказуемые старые состояния.
      // e.code вместо e.key — чтобы работало и в русской раскладке (Ctrl+Я).
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.code === "KeyZ") {
          e.preventDefault();
          if (e.shiftKey) redoEdit();
          else undoEdit();
          return;
        }
        if (e.code === "KeyY" && !e.shiftKey) {
          e.preventDefault();
          redoEdit();
          return;
        }
      }

      // Shift+Enter — мягкий перенос строки внутри абзаца (soft return), как в
      // Word: один <br>, без завершения абзаца. Перехватываем ради единообразия
      // между браузерами и корректной установки каретки (в конце блока нужен
      // «якорный» <br>, иначе каретка не встаёт на новую строку).
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        const editor = editorRef.current;
        if (!editor || !editor.isContentEditable) return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.startContainer)) return;
        range.deleteContents();
        const br = document.createElement("br");
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        const brBlock = topLevelBlockOf(editor, br);
        if (brBlock && caretAtBlockEnd(brBlock, range)) {
          const anchor = document.createElement("br");
          br.after(anchor);
          range.setStartBefore(anchor);
          range.collapse(true);
        }
        selection.removeAllRanges();
        selection.addRange(range);
        syncEditorAfterDomEdit();
        return;
      }

      // Enter на ПУСТОМ пункте списка — выход из списка (как в Word): outdent
      // либо понижает уровень вложенного пункта, либо выносит пункт из списка
      // обычным блоком. Непустые пункты обрабатывает нативный split (Enter не
      // перехватываем — наследование формата идёт через defaultParagraphSeparator).
      if (e.key === "Enter" && !e.shiftKey) {
        const editor = editorRef.current;
        if (editor && editor.isContentEditable) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            if (editor.contains(range.startContainer)) {
              const li = closestLiOf(editor, range.startContainer);
              if (
                li &&
                !(li.textContent || "").trim() &&
                !li.querySelector("img,table")
              ) {
                e.preventDefault();
                commitHistoryNow();
                execCmd("outdent");
                syncEditorAfterDomEdit();
                return;
              }

              // Enter внутри блока, разрезанного пагинацией по границе страницы
              // (data-page-split): нативный split создаёт новый блок, который
              // наследует id группы, и шаг слияния пагинации склеивает половины
              // обратно — перенос «мерцал и откатывался». Делим блок сами и
              // разводим половины по разным группам: всё до курсора остаётся в
              // старой группе (абзац до переноса), курсорный хвост и нижележащие
              // куски получают новый id (абзац после переноса) — слияние их уже
              // не соединит, а пагинация переразложит по страницам заново.
              const block = topLevelBlockOf(editor, range.startContainer);
              const gid = block?.getAttribute(AUTOSPLIT_ATTR) || null;
              if (block && gid && PAGE_SPLITTABLE_TAGS.has(block.tagName)) {
                e.preventDefault();
                commitHistoryNow();

                const pieces = Array.from(
                  editor.querySelectorAll<HTMLElement>(
                    `[${AUTOSPLIT_ATTR}="${gid}"]`,
                  ),
                );
                const k = pieces.indexOf(block);
                const hasBefore = k > 0;
                const hasAfter = k >= 0 && k < pieces.length - 1;

                // Хвост блока (после курсора) уносим в блок-клон.
                const cut = document.createRange();
                cut.setStart(range.startContainer, range.startOffset);
                cut.setEnd(block, block.childNodes.length);
                const next = block.cloneNode(false) as HTMLElement;
                next.appendChild(cut.extractContents());

                // Пустую половину держит placeholder <br> — но только если она не
                // сольётся с соседями по своей группе (иначе лишняя пустая строка).
                if (
                  !hasBefore &&
                  !(block.textContent || "").length &&
                  !block.querySelector("br,img")
                ) {
                  block.appendChild(document.createElement("br"));
                }
                if (
                  !hasAfter &&
                  !(next.textContent || "").length &&
                  !next.querySelector("br,img")
                ) {
                  next.appendChild(document.createElement("br"));
                }

                block.after(next);

                // Разводим группы: старый id — по курсорный блок включительно,
                // новый id — клон next и все нижележащие куски прежней группы.
                const newGid = `g${++splitGroupSeq}`;
                next.setAttribute(AUTOSPLIT_ATTR, newGid);
                for (let j = k + 1; j < pieces.length; j++) {
                  pieces[j].setAttribute(AUTOSPLIT_ATTR, newGid);
                }

                const pos = charPosAt(next, 0);
                const caret = document.createRange();
                caret.setStart(pos.node, pos.offset);
                caret.collapse(true);
                selection.removeAllRanges();
                selection.addRange(caret);

                syncEditorAfterDomEdit();
                return;
              }
            }
          }
        }
      }

      // Tab / Shift+Tab — контекстное поведение как в Word:
      //  • в списке   → изменение уровня пункта (indent/outdent);
      //  • Shift+Tab  → удаление табулятора слева (фокус НЕ уводим из редактора —
      //                 дефолт браузера перенёс бы его на предыдущий элемент);
      //  • иначе      → вставка ВЫДЕЛЯЕМОГО табулятора (прогон неразрывных
      //                 пробелов). В т.ч. в начале абзаца: НЕ используем CSS
      //                 text-indent — он не содержимое и не попадает в Ctrl+A.
      if (e.key === "Tab") {
        e.preventDefault();
        const editor = editorRef.current;
        if (!editor || !editor.isContentEditable) return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.startContainer)) return;

        // 1) Список — менять уровень пункта
        if (closestLiOf(editor, range.startContainer)) {
          execCmd(e.shiftKey ? "outdent" : "indent");
          return;
        }

        const block = topLevelBlockOf(editor, range.startContainer);

        if (e.shiftKey) {
          // Убрать табулятор слева (или тот, внутри которого стоит каретка).
          if (deleteTabBeforeCaret(range)) {
            selection.removeAllRanges();
            selection.addRange(range);
            syncEditorAfterDomEdit();
            return;
          }
          // Легаси/импорт из Word: уменьшить красную строку, заданную в стиле.
          const indent = getTextIndentCm(block);
          if (block && indent > 0) {
            commitHistoryNow();
            const next = Math.max(0, indent - TAB_STEP_CM);
            block.style.textIndent = next > 0 ? `${next}cm` : "";
            syncEditorAfterDomEdit();
          }
          return;
        }

        // Tab (в т.ч. в начале абзаца) — вставляем ВЫДЕЛЯЕМЫЙ табулятор.
        const blockWasEmpty =
          !!block &&
          !(block.textContent || "").length &&
          !block.querySelector("img,table");
        range.deleteContents();
        const tabNode = makeTabSpacer(tabNbspCount(editor));
        range.insertNode(tabNode);
        // Пустой блок держал placeholder <br> — после вставки табулятора он лишний
        // (иначе под строкой осталась бы пустая строка).
        if (blockWasEmpty && block) {
          block.querySelectorAll(":scope > br").forEach((br) => br.remove());
        }
        range.setStartAfter(tabNode);
        range.setEndAfter(tabNode);
        selection.removeAllRanges();
        selection.addRange(range);
        // Вставка через Range идёт мимо события input — синхронизируем стейт
        // и историю вручную (иначе Tab не попадал ни в тело письма, ни в undo).
        syncEditorAfterDomEdit();
        return;
      }

      // Стрелки на границе страниц: между блоками стоит невидимая распорка
      // (contenteditable=false, большая высота). Вертикальная навигация браузера
      // геометрическая — каретка «проваливается» в пустоту распорки и застревает,
      // требуя второго нажатия. Перехватываем ТОЛЬКО когда каретка на краю блока
      // и за границей действительно есть распорка/разрыв: тогда ставим её в
      // начало/конец соседнего блока. Мид-блочную навигацию не трогаем (caretAt*
      // истинны лишь на первой/последней визуальной строке блока).
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft"
      ) {
        if (e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
        const editor = editorRef.current;
        if (!editor) return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
        const range = sel.getRangeAt(0);
        if (!editor.contains(range.startContainer)) return;
        const block = topLevelBlockOf(editor, range.startContainer);
        if (!block) return;

        const forward = e.key === "ArrowDown" || e.key === "ArrowRight";
        const atEdge = forward
          ? caretAtBlockEnd(block, range)
          : caretAtBlockStart(block, range);
        if (!atEdge) return;

        const neighbour = blockAcrossPageBoundary(block, forward ? "next" : "prev");
        if (!neighbour) return;

        // Список — крайний пункт; атомарный блок (таблица/картинка) отдаём дефолту.
        let target: HTMLElement = neighbour;
        if (neighbour.tagName === "UL" || neighbour.tagName === "OL") {
          const li = forward
            ? neighbour.firstElementChild
            : neighbour.lastElementChild;
          if (!li) return;
          target = li as HTMLElement;
        } else if (EDITOR_ATOMIC_TAGS.has(neighbour.tagName)) {
          return;
        }

        const pos = forward
          ? charPosAt(target, 0)
          : charPosAt(target, (target.textContent || "").length);
        e.preventDefault();
        const r = document.createRange();
        r.setStart(pos.node, pos.offset);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
        return;
      }

      if (e.key !== "Backspace" && e.key !== "Delete") return;
      const editor = editorRef.current;
      if (!editor) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      if (!editor.contains(range.startContainer)) return;
      const block = topLevelBlockOf(editor, range.startContainer);
      if (!block) return;

      const setCaret = (node: Node, offset: number) => {
        const r = document.createRange();
        r.setStart(node, offset);
        r.collapse(true);
        sel.removeAllRanges();
        sel.addRange(r);
      };

      // Служебные узлы (распорки, печать ЭЦП, пустой текст) рядом с блоком
      const collectBoundary = (
        start: ChildNode | null,
        dir: "prev" | "next",
      ) => {
        const spacers: ChildNode[] = [];
        let n = start;
        while (
          n &&
          (isSpacerNode(n) ||
            isStampNode(n) ||
            (n.nodeType === Node.TEXT_NODE && !(n.textContent || "").trim()))
        ) {
          if (isSpacerNode(n)) spacers.push(n);
          n = dir === "prev" ? n.previousSibling : n.nextSibling;
        }
        return { spacers, stop: n };
      };

      if (e.key === "Backspace") {
        if (!caretAtBlockStart(block, range)) return;
        const { spacers, stop } = collectBoundary(
          block.previousSibling,
          "prev",
        );

        if (isPageBreakNode(stop)) {
          e.preventDefault();
          commitHistoryNow();
          stop.remove();
          spacers.forEach((s) => s.remove());
          syncEditorAfterDomEdit();
          return;
        }

        // Своё слияние блоков и БЕЗ распорок (обычные соседние абзацы на одной
        // странице): дефолт браузера тянет формат из произвольной стороны и
        // ломает разметку. mergeAcrossBoundary вливает текущий блок в приёмник,
        // СОХРАНЯЯ формат приёмника (как в Word). Атомарные блоки (img/table) и
        // <hr> оставляем дефолту — там слияние абзацев неуместно.
        const prevIsMergeable =
          !!stop &&
          stop.nodeType === Node.ELEMENT_NODE &&
          (stop as HTMLElement).tagName !== "HR" &&
          !EDITOR_ATOMIC_TAGS.has((stop as HTMLElement).tagName);
        if (!spacers.length && !prevIsMergeable) return;

        e.preventDefault();
        commitHistoryNow();
        spacers.forEach((s) => s.remove());
        if (stop && stop.nodeType === Node.ELEMENT_NODE) {
          const target = stop as HTMLElement;
          if (target.tagName === "HR") {
            target.remove();
          } else {
            const pos = mergeAcrossBoundary(target, block);
            if (pos) setCaret(pos.node, pos.offset);
          }
        }
        syncEditorAfterDomEdit();
        return;
      }

      if (!caretAtBlockEnd(block, range)) return;
      const { spacers, stop } = collectBoundary(block.nextSibling, "next");

      if (isPageBreakNode(stop)) {
        e.preventDefault();
        commitHistoryNow(); // набор до операции — отдельный шаг истории
        stop.remove();
        spacers.forEach((s) => s.remove());
        syncEditorAfterDomEdit();
        return;
      }

      // Зеркально Backspace: своё слияние со следующим блоком и без распорок.
      const nextIsMergeable =
        !!stop &&
        stop.nodeType === Node.ELEMENT_NODE &&
        (stop as HTMLElement).tagName !== "HR" &&
        !EDITOR_ATOMIC_TAGS.has((stop as HTMLElement).tagName);
      if (!spacers.length && !nextIsMergeable) return;

      e.preventDefault();
      commitHistoryNow(); // набор до операции — отдельный шаг истории
      spacers.forEach((s) => s.remove());
      if (stop && stop.nodeType === Node.ELEMENT_NODE) {
        const nextBlock = stop as HTMLElement;
        if (nextBlock.tagName === "HR") {
          nextBlock.remove();
        } else {
          const pos = mergeAcrossBoundary(block, nextBlock);
          if (pos) setCaret(pos.node, pos.offset);
        }
      }
      syncEditorAfterDomEdit();
    },
    [syncEditorAfterDomEdit, commitHistoryNow, undoEdit, redoEdit, execCmd],
  );

  // Ручной разрыв страницы: текст после курсора начинается с нового листа.
  // Сам маркер невидим (нулевая высота), break-after — для печати/экспорта.
  const insertPageBreak = useCallback(() => {
    const editor = editorRef.current;
    // contentEditable=false означает режим «только чтение» (подписано/старая версия)
    if (!editor || !editor.isContentEditable) return;
    // Набор до разрыва — отдельный шаг истории; сам разрыв зафиксирует
    // syncEditorAfterDomEdit в конце.
    commitHistoryNow();
    editor.focus();

    const breakEl = document.createElement("div");
    breakEl.setAttribute(PAGE_BREAK_ATTR, "1");
    breakEl.setAttribute("contenteditable", "false");
    breakEl.setAttribute("aria-hidden", "true");
    breakEl.style.cssText =
      "height:0;line-height:0;font-size:0;break-after:page;page-break-after:always;user-select:none;-webkit-user-select:none;pointer-events:none;";

    const sel = window.getSelection();
    const range =
      sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)
        ? sel.getRangeAt(0)
        : null;
    const block = range ? topLevelBlockOf(editor, range.startContainer) : null;

    const makeEmptyPara = () => {
      const p = document.createElement("p");
      p.appendChild(document.createElement("br"));
      return p;
    };

    let caretNode: Node;

    if (range && block && PAGE_SPLITTABLE_TAGS.has(block.tagName)) {
      // Блок с курсором делим на «до/после»: хвост уезжает на новую страницу.
      // Если блок был частью авторазреза — расформировываем группу, иначе
      // очистка HTML склеит куски обратно поверх ручного разрыва.
      const gid = block.getAttribute(AUTOSPLIT_ATTR);
      if (gid) {
        editor
          .querySelectorAll(`[${AUTOSPLIT_ATTR}="${gid}"]`)
          .forEach((el) => el.removeAttribute(AUTOSPLIT_ATTR));
      }
      const tail = document.createRange();
      tail.setStart(range.endContainer, range.endOffset);
      tail.setEnd(block, block.childNodes.length);
      const frag = tail.extractContents();
      const next = block.cloneNode(false) as HTMLElement;
      next.removeAttribute(AUTOSPLIT_ATTR);
      next.appendChild(frag);
      if (!(next.textContent || "").length && !next.querySelector("br,img")) {
        next.appendChild(document.createElement("br"));
      }
      if (!(block.textContent || "").length && !block.querySelector("br,img")) {
        block.appendChild(document.createElement("br"));
      }
      block.after(breakEl, next);
      caretNode = next;
    } else if (block) {
      // Списки/таблицы не делим — разрыв после всего блока + пустой абзац
      const para = makeEmptyPara();
      block.after(breakEl, para);
      caretNode = para;
    } else if (range) {
      // «Голый» текст на верхнем уровне (до первого Enter) — делим текстовый узел
      let topNode: Node | null = range.startContainer;
      while (topNode && topNode.parentNode !== editor)
        topNode = topNode.parentNode;
      if (topNode && topNode.nodeType === Node.TEXT_NODE) {
        const textNode = topNode as Text;
        const splitAt =
          range.startContainer === textNode
            ? range.startOffset
            : textNode.length;
        const tailText = textNode.splitText(splitAt);
        textNode.after(breakEl);
        if (tailText.length === 0) {
          tailText.remove();
          const para = makeEmptyPara();
          breakEl.after(para);
          caretNode = para;
        } else {
          caretNode = tailText;
        }
      } else {
        const para = makeEmptyPara();
        editor.append(breakEl, para);
        caretNode = para;
      }
    } else {
      const para = makeEmptyPara();
      editor.append(breakEl, para);
      caretNode = para;
    }

    const r = document.createRange();
    r.setStart(caretNode, 0);
    r.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(r);

    syncEditorAfterDomEdit();
  }, [syncEditorAfterDomEdit, commitHistoryNow]);

  // Удаление конкретной страницы: убираем верхнеуровневые блоки, визуально
  // расположенные на ней, плюс ручной разрыв, который её породил. Так не нужно
  // вручную стирать весь текст. Операция обратима через собственную историю
  // изменений (Ctrl+Z), подтверждение оставлено как защита от случайного клика.
  const deletePage = useCallback(
    (pageIndex: number) => {
      const editor = editorRef.current;
      setPageToDelete(null);
      if (!editor || !editor.isContentEditable) return;
      // Правки до удаления страницы — отдельный шаг истории.
      commitHistoryNow();

      const children = Array.from(editor.children);
      const removals: Element[] = [];
      let firstIdx = -1;

      children.forEach((child, idx) => {
        if (isSpacerNode(child)) return; // распорки пересоздаются при пагинации
        // печать ЭЦП и прочие абсолютные элементы не трогаем
        if (
          isStampNode(child) ||
          getComputedStyle(child).position === "absolute"
        )
          return;
        const el = child as HTMLElement;
        const page = Math.floor(
          (el.offsetTop + el.offsetHeight / 2) / PAGE_STRIDE,
        );
        if (page === pageIndex) {
          removals.push(child);
          if (firstIdx === -1) firstIdx = idx;
        }
      });

      // Ручной разрыв, создавший эту страницу, удаляем вместе с её содержимым
      if (firstIdx > 0) {
        let j = firstIdx - 1;
        while (j >= 0 && isSpacerNode(children[j])) j--;
        if (j >= 0 && isPageBreakNode(children[j])) removals.push(children[j]);
      }

      if (!removals.length) return;
      removals.forEach((n) => n.remove());

      // Не оставляем редактор полностью пустым — иначе ломаются курсор/плейсхолдер
      if (
        !editor.textContent?.trim() &&
        !editor.querySelector("img,table,br")
      ) {
        editor.innerHTML = "<div><br></div>";
      }

      syncEditorAfterDomEdit();
    },
    [PAGE_STRIDE, syncEditorAfterDomEdit, commitHistoryNow],
  );

  // Закрываем подтверждение удаления, если страниц стало меньше
  useEffect(() => {
    if (pageToDelete !== null && pageToDelete >= pageCount) {
      setPageToDelete(null);
    }
  }, [pageCount, pageToDelete]);

  // Вставка готового DOM-фрагмента в позицию курсора (или в конец, если фокуса
  // нет). Используется и при Ctrl+V, и при импорте Word-файла, чтобы вставка
  // вела себя одинаково и корректно пересчитывала постраничную разбивку.
  const insertFragmentAtCaret = useCallback(
    (fragment: DocumentFragment) => {
      const editor = editorRef.current;
      if (!editor) return;
      // Набор текста до вставки — отдельный шаг истории; сама вставка
      // зафиксируется в syncEditorAfterDomEdit ниже.
      commitHistoryNow();
      editor.focus();

      const selection = window.getSelection();
      let range: Range;
      if (
        selection &&
        selection.rangeCount > 0 &&
        editor.contains(selection.anchorNode)
      ) {
        range = selection.getRangeAt(0);
      } else {
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
      }
      range.deleteContents();

      // Блочный контент (импорт Word, вставка многостраничного документа) должен
      // ложиться ВЕРХНЕУРОВНЕВЫМИ блоками редактора. После очистки (CTRL+A+Delete)
      // редактор сбрасывается в пустой блок-плейсхолдер <div><br></div>, и каретка
      // стоит ВНУТРИ него. Тогда range.insertNode вложил бы все абзацы документа
      // в этот один <div>: постраничная разбивка считает его одним «гигантским»
      // блоком, режет по тексту (теряя форматирование), а печать сваливает всё на
      // первую страницу и обрезает не влезшее (пропадал нижний текст письма).
      // Поэтому, если каретка в пустом плейсхолдере, поднимаем точку вставки на
      // уровень редактора и убираем плейсхолдер.
      const fragmentHasBlocks = Array.from(fragment.childNodes).some(
        (n) =>
          n.nodeType === Node.ELEMENT_NODE &&
          EDITOR_BLOCK_TAGS.has((n as HTMLElement).tagName),
      );
      let placeholder: HTMLElement | null = null;
      if (fragmentHasBlocks && range.startContainer !== editor) {
        const topBlock = topLevelBlockOf(editor, range.startContainer);
        if (
          topBlock &&
          !(topBlock.textContent || "").trim() &&
          !topBlock.querySelector("img,table,hr")
        ) {
          placeholder = topBlock;
          range = document.createRange();
          range.setStartBefore(topBlock);
          range.collapse(true);
        }
      }

      const lastNode = fragment.lastChild;
      range.insertNode(fragment);
      placeholder?.remove();

      // Инлайновые куски вставки, оказавшиеся на верхнем уровне редактора,
      // сразу заворачиваем в блоки: «голые» узлы ломают структурный снимок
      // каретки и постраничную разбивку (см. wrapBareTopLevelNodes).
      wrapBareTopLevelNodes(editor);

      // Курсор после вставленного содержимого
      if (lastNode && editor.contains(lastNode)) {
        const after = document.createRange();
        after.setStartAfter(lastNode);
        after.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(after);
      }

      // Пагинация синхронно, а не через rAF: при серии быстрых вставок каждая
      // следующая ложится в уже разложенный документ с актуальными распорками,
      // а не в «хвост» с устаревшей разметкой — без случайных пустых
      // промежутков и лишних отступов.
      syncEditorAfterDomEdit();
    },
    [syncEditorAfterDomEdit, commitHistoryNow],
  );

  // Превращает очищенный HTML из Word в фрагмент для вставки.
  // Распорки страниц вырезаем — их редактор расставляет сам при пагинации.
  const buildFragmentFromHtml = useCallback((html: string) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    wrapper.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => n.remove());
    const fragment = document.createDocumentFragment();
    while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
    return fragment;
  }, []);

  // Инлайновый фрагмент для вставки однострочного форматированного текста: блоки
  // (p/div/h*/li/…) разворачиваем в их содержимое, чтобы вставка шла В СТРОКУ
  // рядом с курсором, но сохраняла оформление (жирный/курсив/подчёркивание/цвет/
  // размер через span style). Иначе одиночное скопированное слово либо уезжало
  // на новую строку (как блок), либо теряло стили (как голый текст).
  const buildInlineFragmentFromHtml = useCallback((html: string) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    wrapper.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => n.remove());
    const BLOCK_SEL =
      "p,div,h1,h2,h3,h4,h5,h6,li,ul,ol,table,thead,tbody,tr,td,th,blockquote,section,header,footer,pre,figure";
    let guard = 0;
    let block = wrapper.querySelector(BLOCK_SEL);
    while (block && guard++ < 2000) {
      block.replaceWith(...Array.from(block.childNodes));
      block = wrapper.querySelector(BLOCK_SEL);
    }
    const fragment = document.createDocumentFragment();
    while (wrapper.firstChild) fragment.appendChild(wrapper.firstChild);
    return fragment;
  }, []);

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
    [buildFragmentFromHtml, buildInlineFragmentFromHtml, insertFragmentAtCaret],
  );

  const mammothToEditorHtml = useCallback((html: string) => {
    const root = document.createElement("div");
    root.innerHTML = html;

    root.querySelectorAll<HTMLElement>("[class*='pfmt_']").forEach((el) => {
      const cls = Array.from(el.classList).find((c) => c.startsWith("pfmt_"));
      if (!cls) return;
      const [, align, fl, left] = cls.split("_");
      if (align && align !== "left") el.style.textAlign = align;
      if (Number(fl) > 0) el.style.textIndent = `${fl}px`;
      if (Number(left) > 0) el.style.marginLeft = `${left}px`;
    });

    // Пустые абзацы (mammoth их сохраняет при ignoreEmptyParagraphs:false)
    // должны занимать строку, как в Word.
    root.querySelectorAll<HTMLElement>("p").forEach((p) => {
      if (!p.textContent?.trim() && !p.querySelector("img,br,table"))
        p.appendChild(document.createElement("br"));
    });

    Array.from(root.querySelectorAll<HTMLElement>(".docx-page-break")).forEach(
      (marker) => liftPageBreakMarker(root, marker),
    );

    return root.innerHTML;
  }, []);

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
  // браузера (иначе контент дублировался — нативная + ручная вставка).
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.addEventListener("paste", handleEditorPaste);
    return () => editor.removeEventListener("paste", handleEditorPaste);
  }, [handleEditorPaste]);

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
    [commitHistoryNow, syncEditorAfterDomEdit],
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
  }, [handleEditorCopyCut]);

  useEffect(() => {
    document.execCommand("styleWithCSS", false, "true");
    // Единая модель «абзаца»: Enter должен создавать <p>, а не <div> (Chrome по
    // умолчанию делает <div>, Firefox — <br>). Выравнивает браузеры на <p> —
    // тот же тег, что приходит из вставки/импорта Word (см. модель блоков 4.9).
    document.execCommand("defaultParagraphSeparator", false, "p");
  }, []);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const updatePageCount = () => {
      const nextPageCount = paginateEditor();
      if (nextPageCount !== pageCount) {
        setPageCount(nextPageCount);
      }
    };

    // Неисполненный кадр отменяем при каждом новом изменении: при быстрых
    // последовательных вставках/вводе выполняется одна актуальная пагинация,
    // а не очередь устаревших друг за другом.
    const raf = window.requestAnimationFrame(updatePageCount);
    return () => window.cancelAnimationFrame(raf);
  }, [
    editorContent,
    orientation,
    fontSize,
    pageCount,
    paginateEditor,
    marginLeft,
    marginRight,
  ]);

  // Страховка от «пропущенной» пагинации: если высота содержимого изменилась
  // мимо наших обработчиков (загрузилась картинка из Word, внешняя замена
  // innerHTML без изменения стейта, поздний шрифт), а перепагинация не
  // запускалась — текст лёг бы в зазор между листами. Собственные правки
  // пагинатора цикл не создают: после его прохода высота записана в
  // lastPaginatedHeightRef и совпадает с наблюдаемой.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (editor.scrollHeight === lastPaginatedHeightRef.current) return;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        if (editor.scrollHeight === lastPaginatedHeightRef.current) return;
        if (paginateEditorRef.current) {
          setPageCount(paginateEditorRef.current());
        }
      });
    });
    ro.observe(editor);
    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const picked = Array.from(files);
    // Сбрасываем input сразу: иначе повторный выбор того же файла не даст change.
    e.target.value = "";

    const accepted: AttachedFile[] = [];
    // Лимит общий на письмо, поэтому считаем и уже загруженные вложения.
    let freeSlots = MAX_ATTACHMENTS - attachments.length;

    for (const f of picked) {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      if (!ATTACHMENT_EXTENSIONS.includes(ext)) {
        toast.error(`«${f.name}»: недопустимый формат файла`);
        continue;
      }
      if (f.size > MAX_ATTACHMENT_SIZE_MB * 1024 * 1024) {
        toast.error(`«${f.name}»: файл больше ${MAX_ATTACHMENT_SIZE_MB} МБ`);
        continue;
      }
      if (freeSlots <= 0) {
        toast.error(`К письму можно прикрепить не больше ${MAX_ATTACHMENTS} файлов`);
        break;
      }
      freeSlots -= 1;
      accepted.push({
        id: `f-${Date.now()}-${f.name}`,
        name: f.name,
        size: formatFileSize(f.size),
        type: ext.toUpperCase() || "FILE",
        // Сам файл держим в стейте до сохранения — он уйдёт на бэкенд
        // вместе с письмом (multipart), отдельной загрузки вложений нет.
        file: f,
      });
    }

    if (accepted.length) setAttachments((prev) => [...prev, ...accepted]);
  };

  const applyFinalDS = async () => {
    if (!id || !finalSigner) return;
    // Подписать можно только версию, выбранную «Для подписи». Иначе ЭЦП ушла бы
    // на одну версию, а штамп остался бы на открытой в редакторе другой версии.
    if (!isActiveVersionForSign) return;

    if (!stampVisible) {
      setStampVisible(true);
    }

    setFinalSigner((prev) => (prev ? { ...prev, dsLoading: true } : null));

    try {
      const payloadData = await signaturesPayloadAsync({ action: "sign" });
      if (payloadData?.signature_id && payloadData?.nonce) {
        signaturesConfirm({
          signature_id: payloadData.signature_id,
          nonce: payloadData.nonce,
          method: "simple",
        });
      } else {
        console.error("Отсутствуют signature_id или nonce в ответе");
        setFinalSigner((prev) => (prev ? { ...prev, dsLoading: false } : null));
      }
    } catch (error) {
      console.error("Ошибка при подписании:", error);
      setFinalSigner((prev) => (prev ? { ...prev, dsLoading: false } : null));
    }
  };

  const applyApproverDS = (recordId: string) => {
    const approverObj = approvers.find((a) => a.approvalRecordId === recordId);
    const rawNote = approverObj?.comment?.trim();
    const note = rawNote && rawNote.length > 0 ? rawNote : null;

    setApprovers((prev) =>
      prev.map((a) =>
        a.approvalRecordId === recordId ? { ...a, dsLoading: true } : a,
      ),
    );

    approvalsConfirm({
      approvalRecordId: recordId,
      status: "approved",
      note,
    });
  };

  const toggleApproverComment = (id: string) => {
    setApprovers((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, showCommentInput: !a.showCommentInput } : a,
      ),
    );
  };

  const updateApproverComment = (id: string, comment: string) => {
    setApprovers((prev) =>
      prev.map((a) => (a.id === id ? { ...a, comment } : a)),
    );
  };

  const addApprover = (r: RecipientOption) => {
    setApprovers((prev) => [
      ...prev,
      {
        id: r.id,
        approvalRecordId: undefined,
        name: r.name,
        role: r.org,
        initials: r.initials,
        color: "bg-slate-100 text-slate-700",
        approved: false,
        approving: false,
        comment: "",
        showCommentInput: false,
        dsApplied: false,
        dsLoading: false,
      },
    ]);
  };

  const addIncomingLetter = (letter: any) => {
    const alreadyAdded = attachedIncomingLetters.some(
      (l: any) => l.id === letter.id,
    );
    if (!alreadyAdded) {
      setAttachedIncomingLetters((prev) => [...prev, letter]);
    }
  };

  const removeIncomingLetter = (letterId: string | number) => {
    setAttachedIncomingLetters((prev) =>
      prev.filter((l: any) => l.id !== letterId),
    );
  };

  const handleAttachIncomingLetters = () => {
    if (id && attachedIncomingLetters.length > 0) {
      attachedIncomingLetters.forEach((letter) => {
        attachIncoming({ incoming_id: letter.id });
      });
      setAttachedIncomingLetters([]);
    }
  };

  const handleInsertStamp = () => {
    // Место для ЭЦП можно указывать только на версии, выбранной «Для подписи».
    if (!isActiveVersionForSign) return;
    setStampVisible(true);
    setStampPos({ x: 40, y: 40 });
    setStampSize({
      width: DS_STAMP_DEFAULT_WIDTH,
      height: DS_STAMP_DEFAULT_HEIGHT,
    });
  };

  const handleStampMouseDown = (e: React.MouseEvent) => {
    if (finalSigner?.dsApplied) return;

    e.preventDefault();
    e.stopPropagation();
    isDraggingStamp.current = true;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingStamp.current || !editorRef.current) return;

      const cr = editorRef.current.getBoundingClientRect();

      // Вычисляем максимальную доступную высоту на основе сгенерированных страниц,
      // а не высоты контента внутри editorRef.
      // Вычитаем PAGE_PAD_V * 2, чтобы штамп оставался строго в границах печатной области.
      const maxCanvasHeight =
        pageCount * PAGE_STRIDE - PAGE_GAP - PAGE_PAD_V * 2;
      const currentStampWidth =
        typeof stampSize.width === "number"
          ? stampSize.width
          : DS_STAMP_DEFAULT_WIDTH;
      const currentStampHeight =
        typeof stampSize.height === "number"
          ? stampSize.height
          : DS_STAMP_DEFAULT_HEIGHT;

      setStampPos({
        x: Math.max(
          0,
          Math.min(
            ev.clientX - cr.left - dragOffset.current.x,
            cr.width - currentStampWidth,
          ),
        ),
        y: Math.max(
          0,
          Math.min(
            ev.clientY - cr.top - dragOffset.current.y,
            maxCanvasHeight - currentStampHeight,
          ),
        ),
      });
    };

    const onMouseUp = () => {
      isDraggingStamp.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Масштабирование штампа ЭЦП за угловой маркер (только на этапе размещения, до
  // подписания). Пропорции макета фиксированы (SVG preserveAspectRatio), поэтому
  // тянем ТОЛЬКО ширину, а высоту выводим из неё через dsStampHeightForWidth —
  // так экранный, вшитый и печатный штампы остаются идентичными. Выбранный размер
  // хранится в stampSize и уже проброшен во все режимы (плейсхолдер, вшитая
  // картинка при подписании, предпросмотр и печать через getPreviewStamp).
  const handleStampResizeMouseDown = (e: React.MouseEvent) => {
    if (finalSigner?.dsApplied) return;
    // stopPropagation — чтобы захват маркера не запускал перетаскивание штампа.
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth =
      typeof stampSize.width === "number"
        ? stampSize.width
        : DS_STAMP_DEFAULT_WIDTH;

    const onMouseMove = (ev: MouseEvent) => {
      // Верхняя граница: не даём штампу вылезти за правый край печатной области.
      const cr = editorRef.current?.getBoundingClientRect();
      const maxByCanvas = cr ? cr.width - stampPos.x : DS_STAMP_MAX_WIDTH;
      const upperBound = Math.min(DS_STAMP_MAX_WIDTH, Math.max(
        DS_STAMP_MIN_WIDTH,
        maxByCanvas,
      ));
      const nextWidth = Math.round(
        Math.max(
          DS_STAMP_MIN_WIDTH,
          Math.min(startWidth + (ev.clientX - startX), upperBound),
        ),
      );
      setStampSize({
        width: nextWidth,
        height: dsStampHeightForWidth(nextWidth),
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Просмотр вшитого штампа ЭЦП в полном размере (после подписания). Штамп в теле
  // письма — это <img> с data-URI SVG; по клику берём его src и показываем крупно
  // в модалке-оверлее. Ничего в body не добавляем и не исполняем — фича живёт
  // только в слое отображения (как зум в карточке «Подписывающий»).
  const [zoomedStampSrc, setZoomedStampSrc] = useState<string | null>(null);

  const handleCanvasStampZoom = useCallback((e: React.MouseEvent) => {
    const stamp = (e.target as HTMLElement)?.closest?.(
      `[${STAMP_ATTR}]`,
    ) as HTMLElement | null;
    if (!stamp) return;
    const src = stamp.querySelector("img")?.getAttribute("src");
    if (src) setZoomedStampSrc(src);
  }, []);

  useEffect(() => {
    if (!zoomedStampSrc) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setZoomedStampSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomedStampSrc]);

  const selectedImportance =
    importanceOptions.find((o) => o.value === importance) ??
    importanceOptions[0] ??
    IMPORTANCE_OPTIONS[1];

  const isSigned = rawWorkflowData?.data?.signatures?.some(
    (sig: any) => sig.status === "signed",
  );

  const isReadOnly = isSigned || isOldVersionSelected;

  const activeSignatures =
    rawWorkflowData?.data?.signatures?.filter(
      (sig: any) => sig.status !== "revoked",
    ) || [];

  const allSignaturesSigned =
    activeSignatures.length > 0
      ? activeSignatures.every((sig: any) => sig.status === "signed")
      : false;


  useEffect(() => {
    if (allVersions.length === 0) return;
    const targetVersion = allVersions[allVersions.length - 1];

    const isNewVersionId = autoLoadedLatestRef.current !== targetVersion.id;
    autoLoadedLatestRef.current = targetVersion.id;
    setActiveVersionId(targetVersion.id);

    if (editorRef.current && targetVersion.content) {
      const currentCleanHtml = cleanEditorArtifacts(
        editorRef.current.innerHTML,
      );
      const incomingCleanHtml = cleanEditorArtifacts(targetVersion.content);

      if (isNewVersionId && currentCleanHtml !== incomingCleanHtml) {
        editorRef.current.innerHTML = targetVersion.content;
        setEditorContent(targetVersion.content);
        // Пагинируем синхронно, не дожидаясь rAF-цепочки от setEditorContent:
        // она может не сработать (React пропускает рендер при равном значении
        // стейта), а в свежезагруженном теле нет распорок — без немедленной
        // пагинации текст первого рендера ложится в зазор между листами.
        if (paginateEditorRef.current) {
          setPageCount(paginateEditorRef.current());
        }
        // Загружено другое содержимое — прежняя история изменений неприменима.
        resetHistory();
      }
    }

    // ХАК: Если документ только открыли и ни одна версия еще не выбрана для подписи
    // (проверяем по ответу, например, если у всех элементов is_selected === false)
    const hasSelected = allVersions.some((v: any) => v.is_selected);
    if (!hasSelected && targetVersion.id) {
      selectVersionForSign({ versionId: targetVersion.id });
    }
  }, [allVersions]);

  if (sent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] p-10 h-screen w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 flex flex-col items-center gap-4 max-w-sm w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Письмо отправлено
          </h2>
          <p className="text-sm text-slate-500">
            Ваше письмо было успешно подписано и отправлено получателям.
          </p>
          <button
            onClick={onBack}
            className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Вернуться назад
          </button>
        </motion.div>
      </div>
    );
  }

  const UserDropdown = ({
    isOpen,
    onSelect,
    onClose,
    search,
  }: {
    isOpen: boolean;
    onSelect: (user: RecipientOption) => void;
    onClose: () => void;
    search: string;
  }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[999] overflow-y-auto max-h-60"
        >
          {loadingUsers ? (
            <div className="p-4 text-sm text-center text-slate-400">
              Загрузка...
            </div>
          ) : availableUsers.length > 0 ? (
            availableUsers.slice(0, 15).map((r) => (
              <button
                key={r.id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(r);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    r.color,
                  )}
                >
                  {r.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {r.name}
                  </p>
                  <p className="text-xs text-slate-500">{r.org}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-sm text-center text-slate-400">
              Ничего не найдено
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      ref={rootScrollRef}
      className="flex-1 overflow-y-auto bg-[#F8FAFC] h-screen w-full flex flex-col"
    >
      {showPreview && (
        <PreviewModal
          subject={subject}
          editorHtml={editorContent}
          pages={previewPages}
          stamp={previewStamp}
          orientation={orientation}
          fontSize={Number(fontSize) || 14}
          onClose={() => setShowPreview(false)}
          stampVisible={stampVisible && !!finalSigner?.dsApplied}
          stampPos={stampPos}
          stampSize={stampSize}
          stampSignerName={finalSigner?.name || "Неизвестно"}
          stampCertSerial={`SN-2026-${finalSigner?.initials}-84201`}
          stampSignedAt="03.02.2026"
          stampValidUntil="аз 20.03.2025 то 20.03.2026"
          attachments={attachments}
        />
      )}

      {/* Просмотр вшитого штампа ЭЦП в полном размере (после подписания). Портал
          в body — чтобы fixed-оверлей не смещался transform'ами предков.
          Закрытие — по фону, крестику или Escape. */}
      {createPortal(
        <AnimatePresence>
          {zoomedStampSrc && (
            <motion.div
              key="ds-doc-zoom"
              className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-sans"
              onClick={() => setZoomedStampSrc(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="relative w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 8 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-emerald-500" />
                    <span className="text-sm font-semibold text-slate-800">
                      Электронная подпись
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setZoomedStampSrc(null)}
                    aria-label="Закрыть"
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>
                </div>
                <img
                  src={zoomedStampSrc}
                  alt="Электронная подпись"
                  className="block w-full h-auto select-none"
                  draggable={false}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <header className="bg-white border-b border-slate-200 px-6 py-4 z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">
              Создание письма
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
              Черновик
            </span>
          </div>
        </div>
      </header>

      <div className="w-full py-6 px-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span>Назад</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const stamp = getPreviewStamp();
                setPreviewPages(padPagesForStamp(getEditorPages(), stamp));
                setPreviewStamp(stamp);
                setShowPreview(true);
              }}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-colors"
            >
              <Eye size={15} className="text-slate-500" />
              <span className="hidden sm:inline">Предварительный просмотр</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-colors"
            >
              <Printer size={15} className="text-slate-500" />
              <span className="hidden sm:inline">Печать</span>
            </button>

            <button
              onClick={onSaveClick}
              disabled={
                !to.length ||
                !subject.trim() ||
                isSaving ||
                isOldVersionSelected ||
                isSigned ||
                isAlreadySent
              }
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                to.length &&
                  subject.trim() &&
                  !isSaving &&
                  !isOldVersionSelected &&
                  !isSigned &&
                  !isAlreadySent
                  ? "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
                  : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed",
              )}
            >
              {isSaving ? (
                <Clock size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              <span>Сохранить</span>
            </button>

            <If is={canDecline}>
              <button
                type="button"
                onClick={handleDeclineClick}
                className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm font-semibold transition-all border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-xl"
              >
                <X size={15} className="text-red-500" />
                <span>Отклонить</span>
              </button>
            </If>

            <If is={isSigned && !isAlreadySent}>
              <button
                type="button"
                onClick={() => setShowCancelSignConfirm(true)}
                className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm font-semibold transition-all border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-xl"
              >
                <Undo size={15} />
                <span>Отменить подпись</span>
              </button>
            </If>

            {!!id && (
              <button
                onClick={() => {
                  if (
                    !to.length ||
                    !subject.trim() ||
                    isSending ||
                    isAlreadySent
                  )
                    return;
                  setShowSendConfirm(true);
                }}
                disabled={
                  !to.length ||
                  !subject.trim() ||
                  !allSignaturesSigned ||
                  isSending ||
                  isAlreadySent
                }
                className={cn(
                  "flex items-center gap-2 cursor-pointer px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md",
                  to.length &&
                    subject.trim() &&
                    allSignaturesSigned &&
                    !isSending &&
                    !isAlreadySent
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
                )}
              >
                {isSending ? (
                  <Clock size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span>
                  {isSending
                    ? "Отправка..."
                    : isAlreadySent
                      ? "Отправлено"
                      : "Отправить"}
                </span>
              </button>
            )}
          </div>
        </div>

        {panelMode && panelSource && (
          <OriginalLetterPanel
            mode={panelMode}
            sender={
              panelSource.senderName || panelSource.creator?.full_name || "—"
            }
            date={panelSource.date || "—"}
            status={panelSource.status || ""}
            priority={panelSource.priority}
            inboundNumber={panelSource.inboundNumber || "—"}
            subject={panelSource.subject || ""}
            body={panelSource.body}
            sourceId={panelSource.id}
          />
        )}

        <RelatedDocsAccordion
          relatedDocuments={relatedDocs}
          currentDoc={{
            id: id || initialData?.item?.id,
            kind: "outgoing",
            date: initialData?.item?.doc_date || initialData?.item?.created_at,
            reg_number: initialData?.item?.reg_number,
            subject: subject || initialData?.item?.subject,
          }}
        />

        <div className="w-full">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible">
              <div
                onClick={() => setFormExpanded((v) => !v)}
                className="px-6 py-3 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 select-none transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Реквизиты документа
                  </span>
                  {!formExpanded && (
                    <div className="flex items-center gap-1.5 ml-2">
                      {letterType && (
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100">
                          {letterTypeOptions.find((o) => o.value === letterType)?.label ?? letterType}
                        </span>
                      )}
                      {subject && (
                        <span className="text-slate-500 text-xs truncate max-w-[200px] font-medium">
                          — {subject}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">
                    {formExpanded ? "Свернуть" : "Развернуть"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-slate-400 transition-transform duration-200",
                      formExpanded && "rotate-180",
                    )}
                  />
                </div>
              </div>
              <AnimatePresence>
                {formExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-visible"
                  >
                    <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <label className="text-sm font-semibold text-slate-500 pt-2 w-20 flex-shrink-0">
                    Тип
                  </label>
                  <div className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setShowLetterTypeDropdown((v) => !v)}
                      onBlur={() =>
                        setTimeout(() => setShowLetterTypeDropdown(false), 150)
                      }
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                        letterType
                          ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <FileType
                          size={15}
                          className={
                            letterType ? "text-indigo-500" : "text-slate-400"
                          }
                        />
                        {letterType ? (
                          <span>
                            <span className="font-semibold">
                              {letterTypeOptions.find(
                                (o) => o.value === letterType,
                              )?.label ?? letterType}
                            </span>
                            <span className="text-indigo-500 text-xs ml-2">
                              —{" "}
                              {
                                letterTypeOptions.find(
                                  (o) => o.value === letterType,
                                )?.desc
                              }
                            </span>
                          </span>
                        ) : (
                          <span>Выберите тип документа...</span>
                        )}
                      </div>
                      <ChevronDown
                        size={15}
                        className={cn(
                          "transition-transform",
                          showLetterTypeDropdown && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {showLetterTypeDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-[80] overflow-y-auto max-h-[180px] py-1"
                        >
                          {letterTypeOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onMouseDown={() => {
                                setLetterType(opt.value);
                                setShowLetterTypeDropdown(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                                letterType === opt.value && "bg-slate-50",
                              )}
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {opt.label}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {opt.desc}
                                </p>
                              </div>
                              {letterType === opt.value && (
                                <Check size={12} className="text-slate-400" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowImportanceDropdown((v) => !v)}
                      onBlur={() =>
                        setTimeout(() => setShowImportanceDropdown(false), 150)
                      }
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                        selectedImportance.badgeBg,
                        selectedImportance.badgeBorder,
                        selectedImportance.badgeText,
                      )}
                    >
                      <Flag size={14} className={selectedImportance.flagFill} />
                      <span>{selectedImportance.label}</span>
                      <ChevronDown
                        size={13}
                        className={cn(
                          "transition-transform",
                          showImportanceDropdown && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {showImportanceDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.97 }}
                          className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[80] overflow-hidden py-1 min-w-[220px]"
                        >
                          {importanceOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onMouseDown={() => {
                                setImportance(opt.value);
                                setShowImportanceDropdown(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                                importance === opt.value && "bg-slate-50",
                              )}
                            >
                              <span
                                className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 border",
                                  IMPORTANCE_DOT[opt.value],
                                )}
                              />
                              <div className="flex-1">
                                <p
                                  className={cn(
                                    "text-sm font-semibold",
                                    opt.badgeText,
                                  )}
                                >
                                  {opt.label}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {opt.desc}
                                </p>
                              </div>
                              {importance === opt.value && (
                                <Check
                                  size={13}
                                  className="text-slate-400 flex-shrink-0"
                                />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="px-6 pt-5 pb-4 border-b border-slate-100 overflow-visible z-20">
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-500 pt-2">
                      Кому
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenRecipientModal}
                      className="flex items-center justify-center px-1.5 py-1 rounded-lg text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors w-16 cursor-pointer"
                      title="Выбрать получателей из реестра"
                    >
                      Выбрать
                    </button>
                  </div>
                  <div className="flex-1 relative overflow-visible">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {to.map((r) => (
                        <span
                          key={r.id}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                            r.color,
                          )}
                        >
                          <span>{r.initials}</span>
                          <span>{r.name}</span>
                          <button
                            onClick={() =>
                              setTo((prev) => prev.filter((x) => x.id !== r.id))
                            }
                            className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>

                    <input
                      className="w-full text-sm text-slate-700 bg-transparent border-0 outline-none"
                      placeholder="Поиск получателя..."
                      value={toSearch}
                      onChange={(e) => {
                        setToSearch(e.target.value);
                        setSearchParams({ query: e.target.value });
                        setShowToDropdown(true);
                      }}
                      onFocus={() => {
                        setSearchParams({ query: toSearch });
                        setShowToDropdown(true);
                      }}
                      onBlur={() =>
                        setTimeout(() => setShowToDropdown(false), 150)
                      }
                    />
                    <UserDropdown
                      isOpen={showToDropdown}
                      search={toSearch}
                      onClose={() => setShowToDropdown(false)}
                      onSelect={(u) => {
                        setTo([...to, u]);
                        setToSearch("");
                        setSearchParams({ query: "" });
                        setShowToDropdown(false);
                      }}
                    />
                  </div>
                  <button
                    onClick={() => setShowCcField((v) => !v)}
                    className="text-xs text-blue-600 cursor-pointer font-semibold hover:text-blue-800 transition-colors pt-2 flex-shrink-0"
                  >
                    {showCcField ? "- Скрыть копию" : "+ Копия"}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showCcField && (
                  <div className="px-6 pb-4 border-b border-slate-100 overflow-visible z-10">
                    <div className="flex items-start gap-3">
                      <div className="w-20 flex-shrink-0 flex flex-col gap-1">
                        <label className="text-sm font-semibold text-slate-500 pt-2">
                          Копия
                        </label>
                        <button
                          type="button"
                          onClick={handleOpenRecipientModal}
                          className="flex items-center justify-center px-1.5 py-1 rounded-lg text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors w-16 cursor-pointer"
                          title="Выбрать получателей из реестра"
                        >
                          Выбрать
                        </button>
                      </div>
                      <div className="flex-1 relative overflow-visible">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {cc.map((r) => (
                            <span
                              key={r.id}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                                r.color,
                              )}
                            >
                              <span>{r.initials}</span>
                              <span>{r.name}</span>
                              <button
                                onClick={() =>
                                  setCc((prev) =>
                                    prev.filter((x) => x.id !== r.id),
                                  )
                                }
                                className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          className="w-full text-sm text-slate-700 bg-transparent border-0 outline-none"
                          placeholder="Поиск получателя копии..."
                          value={ccSearch}
                          onChange={(e) => {
                            setCcSearch(e.target.value);
                            setSearchParams({ query: e.target.value });
                            setShowCcDropdown(true);
                          }}
                          onFocus={() => {
                            setSearchParams({ query: ccSearch });
                            setShowCcDropdown(true);
                          }}
                          onBlur={() =>
                            setTimeout(() => setShowCcDropdown(false), 150)
                          }
                        />
                        <UserDropdown
                          isOpen={showCcDropdown}
                          search={ccSearch}
                          onClose={() => setShowCcDropdown(false)}
                          onSelect={(u) => {
                            setCc([...cc, u]);
                            setCcSearch("");
                            setSearchParams({ query: "" });
                            setShowCcDropdown(false);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </AnimatePresence>

              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-slate-500 w-20 flex-shrink-0">
                    Тема
                  </label>
                  <input
                    type="text"
                    placeholder="Укажите тему письма..."
                    className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 outline-none focus:outline-none"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 pt-1.5 w-24 flex-shrink-0">
                    <label className="text-sm font-semibold text-slate-500">
                      Вложения
                    </label>
                    <If is={attachments.length > 0}>
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        {attachments.length}
                      </span>
                    </If>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
                    {attachments
                      .filter((a) => a.file)
                      .map((file) => (
                        <div
                          key={file.id}
                          onClick={() => setPreviewAttachment(file)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200 rounded-xl text-xs cursor-pointer transition-all group"
                        >
                          <FileTextIcon className="w-4 h-4 text-amber-500 flex-shrink-0 group-hover:scale-105 transition-transform" />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 truncate max-w-[140px] group-hover:text-blue-600 transition-colors">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {file.size} · не сохранён
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewAttachment(file);
                            }}
                            title="Просмотр вложения"
                            className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0 cursor-pointer"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachments((prev) =>
                                prev.filter((f) => f.id !== file.id),
                              );
                            }}
                            title="Убрать файл"
                            className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isReadOnly || attachments.length >= MAX_ATTACHMENTS}
                      title={`${ATTACHMENT_EXTENSIONS.join(", ")} · до ${MAX_ATTACHMENTS} файлов · до ${MAX_ATTACHMENT_SIZE_MB} МБ каждый`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-50 cursor-pointer"
                    >
                      <Paperclip size={12} />
                      <span>Прикрепить файл</span>
                      {attachments.some((a) => a.file) && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          {attachments.filter((a) => a.file).length}
                        </span>
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={ATTACHMENT_ACCEPT}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Липкая шапка редактора: тулбар форматирования, панель разделов
                  и пагинация входящего письма прилипают к верху экрана при
                  прокрутке — форматирование и разделы всегда под рукой. Общий
                  sticky-контейнер, чтобы полосы не накладывались друг на друга. */}
              <div ref={stickyHeaderRef} className="sticky top-0 z-[70] bg-white">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center gap-0.5">
                <TBtn
                  disabled={isReadOnly || !canUndo}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    undoEdit();
                  }}
                  title="Отменить (Ctrl+Z)"
                >
                  <Undo size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly || !canRedo}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    redoEdit();
                  }}
                  title="Повторить (Ctrl+Y)"
                >
                  <Redo size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.h1}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("formatBlock", "h1");
                  }}
                  title="Заголовок 1"
                >
                  <Heading1 size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.h2}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("formatBlock", "h2");
                  }}
                  title="Заголовок 2"
                >
                  <Heading2 size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <div className="relative flex-shrink-0">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (isReadOnly) return;
                      setShowFontSizeDropdown((v) => !v);
                    }}
                    disabled={isReadOnly}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium transition-colors border",
                      isReadOnly
                        ? "text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed"
                        : "text-slate-600 hover:bg-slate-100 border-slate-200 bg-white",
                    )}
                  >
                    <span>{fontSize}px</span>
                    <ChevronDown
                      size={10}
                      className={cn(
                        "transition-transform",
                        showFontSizeDropdown && "rotate-180",
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {showFontSizeDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 min-w-[72px]"
                      >
                        {FONT_SIZES.map((s) => (
                          <button
                            key={s}
                            onMouseDown={() => handleFontSize(s)}
                            className={cn(
                              "w-full px-3 py-1.5 text-xs font-mono text-left hover:bg-slate-50 transition-colors",
                              fontSize === s &&
                                "bg-blue-50 text-blue-700 font-bold",
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.bold}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("bold");
                  }}
                  title="Жирный"
                >
                  <Bold size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.italic}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("italic");
                  }}
                  title="Курсив"
                >
                  <Italic size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.underline}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("underline");
                  }}
                  title="Подчёркнутый"
                >
                  <Underline size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.strikeThrough}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("strikeThrough");
                  }}
                  title="Зачёркнутый"
                >
                  <Strikethrough size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("hiliteColor", "#fef08a");
                  }}
                  title="Выделить"
                >
                  <Highlighter size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.justifyLeft}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyLeft");
                  }}
                  title="По левому краю"
                >
                  <AlignLeft size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.justifyCenter}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyCenter");
                  }}
                  title="По центру"
                >
                  <AlignCenter size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.justifyRight}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyRight");
                  }}
                  title="По правому краю"
                >
                  <AlignRight size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.justifyFull}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("justifyFull");
                  }}
                  title="По ширине"
                >
                  <AlignJustify size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.insertUnorderedList}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("insertUnorderedList");
                  }}
                  title="Маркированный список"
                >
                  <List size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly}
                  active={activeFmt.insertOrderedList}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("insertOrderedList");
                  }}
                  title="Нумерованный список"
                >
                  <ListOrdered size={14} />
                </TBtn>
                <TBtn
                  disabled={isReadOnly}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd("insertHorizontalRule");
                  }}
                  title="Горизонтальная линия"
                >
                  <Minus size={14} />
                </TBtn>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertPageBreak();
                  }}
                  disabled={isReadOnly}
                  title="Разрыв страницы: текст после курсора начнётся с нового листа"
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border flex-shrink-0",
                    isReadOnly
                      ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <FilePlus2 size={14} />
                  <span>Новая страница</span>
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setOrientation((o) =>
                      o === "portrait" ? "landscape" : "portrait",
                    );
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border flex-shrink-0",
                    orientation === "landscape"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Monitor size={16} />
                  <span>
                    {orientation === "portrait" ? "Книжный" : "Альбомный"}
                  </span>
                </button>
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                {!isReadOnly && (
                  <>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (!importingWord) wordInputRef.current?.click();
                      }}
                      disabled={importingWord}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors border flex-shrink-0 bg-white border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <FileType size={14} />
                      <span>
                        {importingWord ? "Импорт…" : "Импорт Word"}
                      </span>
                    </button>
                    <input
                      ref={wordInputRef}
                      type="file"
                      accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      className="hidden"
                      onChange={handleImportWord}
                    />
                  </>
                )}
                <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 mr-2 ml-1">
                  <input
                    type="checkbox"
                    checked={rulerEnabled}
                    onChange={(e) => setRulerEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Линейка</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 mr-2 ml-1">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toast.info("Функционал «Сетка» находится в разработке")}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Сетка</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toast.info("Функционал «Область навигации» находится в разработке")}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Область навигации</span>
                </label>
                {!!id && (
                  <>
                    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
                      <input
                        type="checkbox"
                        checked={panelsInToolbar}
                        onChange={(e) => setPanelsInToolbar(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Панель разделов сверху</span>
                    </label>
                  </>
                )}
                {panelMode && panelSource && (
                  <>
                    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
                      <input
                        type="checkbox"
                        checked={showOriginalLetterSides}
                        onChange={(e) => toggleOriginalLetterSides(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span>Режим просмотра входящего письма</span>
                    </label>
                  </>
                )}
                <If is={allVersions.length > 0}>
                  <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600 ml-1">
                    <input
                      type="checkbox"
                      checked={showVersionCompareSides}
                      onChange={(e) => toggleVersionCompareSides(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Режим просмотра истории версий</span>
                  </label>
                </If>
              </div>

              {/* Демо-режим: горизонтальная панель разделов под тулбаром.
                  «Цилиндры» открывают те же панели у холста, что и боковые
                  вкладки (боковые вкладки при этом скрыты). */}
              {panelsInToolbar && !!id && (
                <div className="px-3 py-2 border-b border-slate-100 bg-white flex flex-wrap items-center gap-2 font-sans">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mr-1 select-none">
                    Разделы
                  </span>
                  {[
                    {
                      key: "incoming",
                      label: "Входящие письма",
                      dotClass: "bg-blue-500",
                      dotStyle: undefined as React.CSSProperties | undefined,
                      isOpen: incomingOpen,
                      onToggle: () =>
                        incomingOpen ? setIncomingOpen(false) : handleOpenIncoming(),
                    },
                    {
                      key: "versions",
                      label: "История версий",
                      dotClass: "bg-amber-500",
                      dotStyle: undefined,
                      isOpen: versionsOpen,
                      onToggle: () =>
                        versionsOpen ? setVersionsOpen(false) : handleOpenVersions(),
                    },
                    {
                      key: "attachments",
                      label: attachments.length > 0 ? `Вложения (${attachments.length})` : "Вложения",
                      dotClass: "bg-indigo-500",
                      dotStyle: undefined,
                      isOpen: attachmentsOpen,
                      onToggle: () =>
                        attachmentsOpen
                          ? setAttachmentsOpen(false)
                          : handleOpenAttachments(),
                    },
                    {
                      key: "signer",
                      label: "Подписывающий",
                      dotClass: "",
                      dotStyle: { backgroundColor: "oklch(0.6 0.25 250)" },
                      isOpen: signerOpen,
                      onToggle: () =>
                        signerOpen ? setSignerOpen(false) : handleOpenSigner(),
                    },
                    {
                      key: "approvers",
                      label: "Согласующие",
                      dotClass: "",
                      dotStyle: { backgroundColor: "oklch(0.828 0.189 84.429)" },
                      isOpen: approversOpen,
                      onToggle: () =>
                        approversOpen ? setApproversOpen(false) : handleOpenApprovers(),
                    },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={p.onToggle}
                      className={cn(
                        "flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer select-none",
                        p.isOpen
                          ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300",
                      )}
                    >
                      <span
                        className={cn(
                          "w-2.5 h-2.5 rounded-full flex-shrink-0",
                          p.dotClass,
                        )}
                        style={p.dotStyle}
                      />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Закреплённая панель пагинации входящего письма — на всю ширину
                  блока, под разделом с кнопками импорта. При прокрутке страницы
                  прилипает к верхнему краю окна и всегда остаётся доступной. */}
              {showOriginalLetterSides && panelMode && panelSource && (
                <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white border-b border-slate-200 shadow-sm font-sans">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0">
                    <Eye size={14} className="text-amber-500" />
                    <span>Входящее письмо — только просмотр</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {panelSource.id != null && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              `/modules/correspondence/internal/incoming/${panelSource.id}`,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                        >
                          <ExternalLink size={12} />
                          <span>Оригинал</span>
                        </button>
                        <div className="w-px h-4 bg-slate-200" />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => setOriginalPage(Math.max(0, originalCurrent - 1))}
                      disabled={originalCurrent === 0}
                      className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-semibold text-slate-600 tabular-nums whitespace-nowrap">
                      {originalCurrent + 1} / {originalTotal}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setOriginalPage(Math.min(originalTotal - 1, originalCurrent + 1))
                      }
                      disabled={originalCurrent === originalTotal - 1}
                      className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              <If is={Boolean(showVersionCompareSides && activeVersion)}>
                <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white border-b border-slate-200 shadow-sm font-sans">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
                    <Clock size={14} className="text-amber-500" />
                    <span>
                      История версий — Слева: Актуальная версия №{latestVersion?.versionNumber}
                      {" • "}
                      Справа: Версия №{activeVersion?.versionNumber}
                      {activeVersion?.date ? ` (${new Date(activeVersion.date).toLocaleDateString("ru-RU")})` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setVersionComparePage(Math.max(0, versionCompareCurrent - 1))}
                      disabled={versionCompareCurrent === 0}
                      className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-semibold text-slate-600 tabular-nums whitespace-nowrap">
                      {versionCompareCurrent + 1} / {versionCompareTotal}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setVersionComparePage(Math.min(versionCompareTotal - 1, versionCompareCurrent + 1))
                      }
                      disabled={versionCompareCurrent === versionCompareTotal - 1}
                      className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </If>
              </div>

              <div
                className="bg-[#E8EAED] overflow-auto rounded-b-2xl relative"
                style={{ minHeight: 420 }}
                {...(!isReadOnly
                  ? {
                      onDrop: handleEditorDrop,
                      onDragOver: handleEditorDragOver,
                      onDragLeave: handleEditorDragLeave,
                    }
                  : {})}
              >
                {/* Подсказка при перетаскивании .docx в редактор */}
                {isDraggingWord && !isReadOnly && (
                  <div className="absolute inset-0 z-[60] m-3 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/80 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-2 text-blue-700">
                      <FileType size={32} />
                      <span className="text-sm font-semibold">
                        Отпустите, чтобы импортировать документ Word
                      </span>
                    </div>
                  </div>
                )}
                <div className={cn(
                  "py-8 px-8 flex justify-center items-start gap-12 w-full",
                  (showOriginalLetterSides || showVersionCompareSides) && "min-w-max"
                )}>
                  <If is={Boolean(showVersionCompareSides && activeVersion)}>
                    <div ref={versionCompareCanvasWrapRef} className="shrink-0 order-2">
                      <OriginalLetterCanvas
                        sheets={versionCompareSheets.pages}
                        stamp={versionCompareSheets.stamp}
                        page={versionCompareCurrent}
                        fitToViewport={pageCount > 1}
                      />
                    </div>
                  </If>

                  <If is={Boolean(showOriginalLetterSides && panelMode && panelSource)}>
                    <div ref={originalCanvasWrapRef} className="shrink-0 order-2">
                      <OriginalLetterCanvas
                        sheets={originalSheets.pages}
                        stamp={originalSheets.stamp}
                        page={originalCurrent}
                        fitToViewport={pageCount > 1}
                      />
                    </div>
                  </If>

                  <div className="order-1 flex flex-col items-center">
                  {rulerEnabled && (
                    <EditorRuler
                      pageWidth={PAGE_WIDTH}
                      marginLeft={marginLeft}
                      marginRight={marginRight}
                      onChange={(side, value) =>
                        side === "left"
                          ? setMarginLeft(value)
                          : setMarginRight(value)
                      }
                    />
                  )}
                  <div
                    ref={pageCanvasRef}
                    className="relative"
                    style={{
                      width: PAGE_WIDTH,
                      height: pageCount * PAGE_STRIDE - PAGE_GAP,
                      padding: `${PAGE_PAD_V}px ${marginRight}px ${PAGE_PAD_V}px ${marginLeft}px`,
                      fontFamily: "Times New Roman, serif",
                      fontSize: `${fontSize}px`,
                      lineHeight: 1.8,
                      color: "#1e293b",
                      boxSizing: "border-box",
                    }}
                  >
                    {Array.from({ length: pageCount }, (_, index) => (
                      <div
                        key={index}
                        style={{
                          position: "absolute",
                          top: index * PAGE_STRIDE,
                          left: 0,
                          width: "100%",
                          height: PAGE_HEIGHT,
                          background: "#ffffff",
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)",
                          borderRadius: 16,
                          boxSizing: "border-box",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            bottom: 24,
                            left: 0,
                            right: 0,
                            textAlign: "center",
                            fontSize: 11,
                            color: "#94a3b8",
                            fontFamily: "system-ui, sans-serif",
                            userSelect: "none",
                            pointerEvents: "none",
                          }}
                        >
                          Страница {index + 1} из {pageCount}
                        </span>

                        {/* Удаление страницы — без необходимости стирать весь текст вручную.
													Видно только при нескольких страницах и в режиме редактирования. */}
                        {!isReadOnly && pageCount > 1 && (
                          <div
                            contentEditable={false}
                            className="absolute top-3 right-3 z-[45]"
                            style={{ fontFamily: "system-ui, sans-serif" }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            {pageToDelete === index ? (
                              <div className="flex items-center gap-1.5 bg-white border border-rose-200 rounded-xl px-2 py-1.5 shadow-lg">
                                <span className="text-xs text-slate-600 whitespace-nowrap">
                                  Удалить страницу {index + 1}?
                                </span>
                                <button
                                  type="button"
                                  onClick={() => deletePage(index)}
                                  className="px-2 py-1 text-xs font-semibold text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-colors"
                                >
                                  Удалить
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPageToDelete(null)}
                                  className="px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                  Отмена
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                title={`Удалить страницу ${index + 1}`}
                                onClick={() => setPageToDelete(index)}
                                className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 shadow-sm transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    <div
                      ref={editorRef}
                      contentEditable={!isReadOnly}
                      suppressContentEditableWarning
                      data-placeholder="Начните вводить текст письма..."
                      onInput={handleEditorInput}
                      onKeyDown={handleEditorKeyDown}
                      onClick={handleCanvasStampZoom}
                      style={{
                        position: "relative",
                        zIndex: 1,
                        outline: "none",
                        width: "100%",
                        maxWidth: "100%",
                        minHeight: CONTENT_HEIGHT,
                        fontFamily: "Times New Roman, serif",
                        fontSize: `${fontSize}px`,
                        lineHeight: 1.8,
                        color: "#1e293b",
                        whiteSpace: "pre-wrap",
                        // Символ табуляции (\t) при pre-wrap выравнивается по
                        // сетке шага ≈ 1.27 см — как позиции табуляции Word.
                        tabSize: "1.27cm",
                        overflowWrap: "break-word",
                        wordBreak: "break-word",
                        overflow: "visible",
                      }}
                      className="doc-preview-content focus:outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-slate-300 [&:empty]:before:italic [&:empty]:before:pointer-events-none [&_*]:max-w-full [&_*]:!whitespace-pre-wrap [&_*]:break-words [&_img]:h-auto [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_td]:break-words [&_td]:align-top [&_td]:border [&_td]:border-slate-300 [&_td]:px-2 [&_td]:py-1 [&_th]:break-words [&_th]:align-top [&_th]:border [&_th]:border-slate-300 [&_th]:px-2 [&_th]:py-1 [&_pre]:whitespace-pre-wrap [&_p]:!my-0 [&_[data-page-spacer]]:select-none [&_[data-page-spacer]]:pointer-events-none [&_[data-page-break]]:select-none [&_[data-page-break]]:pointer-events-none [&_[data-signature-stamp]]:select-none [&_[data-signature-stamp]]:!cursor-zoom-in"
                    />

                    {/* Плавающий плейсхолдер ЭЦП - виден ТОЛЬКО ДО подписания.
											Показывает реальный рисунок ЭЦП фиксированного размера,
											который сохранится в документе при нажатии "Подписать". */}
                    {stampVisible && finalSigner && !finalSigner.dsApplied && (
                      <div
                        ref={stampRef}
                        onMouseDown={handleStampMouseDown}
                        title="Перетащите, чтобы выбрать место для ЭЦП"
                        style={{
                          position: "absolute",
                          // stampPos хранится в координатах редактора; placeholder —
                          // потомок холста страницы, поэтому добавляем поля страницы,
                          // чтобы он визуально совпал с местом будущей печати.
                          left: marginLeft + stampPos.x,
                          top: PAGE_PAD_V + stampPos.y,
                          width: stampSize.width,
                          height: stampSize.height,
                          zIndex: 50,
                          cursor: "move",
                          userSelect: "none",
                          borderRadius: 8,
                          boxShadow: "0 0 0 2px rgba(59,130,246,0.45)",
                        }}
                      >
                        <DSStamp
                          name={finalSigner.name}
                          certSerial={`SN-2026-${finalSigner.initials}-84201`}
                          signedAt={new Date().toLocaleDateString("ru-RU")}
                          validUntil="аз 20.03.2025 то 20.03.2026"
                        />
                        {/* Угловой маркер масштабирования (только при размещении,
                            до подписания). На вшитый/печатный штамп не влияет —
                            это лишь аффорданс редактора. */}
                        <div
                          onMouseDown={handleStampResizeMouseDown}
                          title="Потяните, чтобы изменить размер ЭЦП"
                          style={{
                            position: "absolute",
                            right: -6,
                            bottom: -6,
                            width: 14,
                            height: 14,
                            borderRadius: 3,
                            background: "#3b82f6",
                            border: "2px solid #fff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                            cursor: "nwse-resize",
                            zIndex: 51,
                          }}
                        />
                      </div>
                    )}
                    {!!id && (
                      <div
                        ref={panelsGroupRef}
                        className="font-sans!"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 0,
                          zIndex: 500,
                          willChange: "transform",

                        }}
                      >
                        <ApproversPanel
                          isOpen={approversOpen}
                          hideTab={panelsInToolbar}
                          openLeft={!showVersionCompareSides && !showOriginalLetterSides}
                          onOpen={handleOpenApprovers}
                          onClose={() => setApproversOpen(false)}
                          approvers={approvers}
                          onAddApprover={addApprover}
                          onRemoveApprover={(approverId) =>
                            setApprovers((prev) => prev.filter((a) => a.id !== approverId))
                          }
                          availableUsers={availableUsers}
                          inviteApprover={inviteApprover}
                          isApproverInviting={isApproverInviting}
                          applyApproverDS={applyApproverDS}
                          toggleApproverComment={toggleApproverComment}
                          updateApproverComment={updateApproverComment}
                          docId={id}
                        />
                        <SignerPanel
                          isOpen={signerOpen}
                          hideTab={panelsInToolbar}
                          openLeft={!showVersionCompareSides && !showOriginalLetterSides}
                          onOpen={handleOpenSigner}
                          onClose={() => setSignerOpen(false)}
                          finalSigner={finalSigner}
                          onAssignSigner={(r) =>
                            setFinalSigner({
                              id: r.id,
                              name: r.name,
                              role: r.org,
                              initials: r.initials,
                              color: "bg-purple-100 text-purple-700",
                              dsApplied: false,
                              dsLoading: false,
                              isInvited: false,
                            })
                          }
                          assignSelfAsSigner={assignSelfAsSigner}
                          inviteSigner={inviteSigner}
                          isSignerInviting={isSignerInviting}
                          applyFinalDS={applyFinalDS}
                          isActiveVersionForSign={isActiveVersionForSign}
                          stampVisible={stampVisible}
                          setStampVisible={setStampVisible}
                          handleInsertStamp={handleInsertStamp}
                          availableUsers={availableUsers}
                          isSigned={isSigned}
                          docCreator={docCreator}
                          docId={id}
                        />
                        <IncomingLettersPanel
                          isOpen={incomingOpen}
                          hideTab={panelsInToolbar}
                          openLeft={!showVersionCompareSides && !showOriginalLetterSides}
                          onOpen={handleOpenIncoming}
                          onClose={() => setIncomingOpen(false)}
                          attachedLetters={attachedIncomingLetters}
                          onAddLetter={addIncomingLetter}
                          onRemoveLetter={removeIncomingLetter}
                          onSaveLetters={handleAttachIncomingLetters}
                          docId={id}
                        />
                        <VersionsPanel
                          isOpen={versionsOpen}
                          hideTab={panelsInToolbar}
                          openLeft={!showVersionCompareSides && !showOriginalLetterSides}
                          onOpen={handleOpenVersions}
                          onClose={() => setVersionsOpen(false)}
                          versions={allVersions}
                          activeVersionId={activeVersionId}
                          signedVersionId={signedVersionId}
                          onSelectVersion={handleSelectVersion}
                          onSetVersionForSign={handleSetVersionForSign}
                          isSelectingVersion={isSelectingVersion}
                          isSigned={isSigned}
                        />
                        <AttachmentsPanel
                          isOpen={attachmentsOpen}
                          hideTab={panelsInToolbar}
                          openLeft={!showVersionCompareSides && !showOriginalLetterSides}
                          onOpen={handleOpenAttachments}
                          onClose={() => setAttachmentsOpen(false)}
                          attachments={attachments}
                          onPreview={setPreviewAttachment}
                          onDownload={downloadAttachment}
                          onUpload={() => fileInputRef.current?.click()}
                          onRemove={(file) =>
                            setAttachments((prev) =>
                              prev.filter((f) => f.id !== file.id),
                            )
                          }
                          isReadOnly={isReadOnly}
                        />

                      </div>
                    )}
                  </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

      </div>
      
      <CancelSignatureModal
        isOpen={showCancelSignConfirm}
        onClose={() => setShowCancelSignConfirm(false)}
        onConfirm={handleConfirmCancelSignature}
        isLoading={isCancellingSign}
      />

      <ConfirmationModal
        open={showSendConfirm}
        title="Отправка письма"
        message="Пожалуйста, перед отправкой внимательно проверьте тему письма, список получателей и прикрепленные файлы. Отменить отправку будет невозможно!"
        confirmText="Отправить"
        icon={<Send size={26} strokeWidth={2.2} />}
        iconBg="bg-blue-50 dark:bg-blue-500/10 text-blue-500"
        confirmBtnBg="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/25"
        onConfirm={async () => {
          sendCorrespondence({});
          setShowSendConfirm(false);
        }}
        onCancel={() => setShowSendConfirm(false)}
      />

      <RecipientSelectModal
        open={showRecipientModal}
        onClose={() => setShowRecipientModal(false)}
        availableUsers={availableUsers}
        initialTo={to}
        initialCc={cc}
        onSave={(nextTo, nextCc) => {
          setTo(nextTo);
          setCc(nextCc);
          if (nextCc.length > 0) {
            setShowCcField(true);
          }
          setShowRecipientModal(false);
        }}
      />
      <If is={!!previewAttachment}>
        <FilePreviewModal
          file={createApiFileFromAttachedFile(previewAttachment)}
          onClose={() => setPreviewAttachment(null)}
          unavailableNotice={CORRESPONDENCE_ATTACHMENT_PREVIEW_NOTICE}
        />
      </If>
      <DeclineReasonModal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        onConfirm={handleConfirmDecline}
        isLoading={isDeclining}
      />
    </div>
  );
};
