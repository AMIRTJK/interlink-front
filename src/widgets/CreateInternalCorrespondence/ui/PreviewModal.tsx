import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Paperclip,
} from "lucide-react";
import { If } from "@shared/ui";
import { cn } from "@shared/lib";
import type { PageOrientation, AttachedFile } from "../types";
import { DSStamp } from "./DSStamp";

const PAGE_PAD_H = 80;
const PAGE_PAD_V = 72;
const PAGE_GAP = 32;
// ВАЖНО: должно совпадать с className холста редактора в
// CreateInternalCorrespondence (таблицы, рамки, отступы), иначе предпросмотр
// будет отличаться от того, что видно в редакторе.
const CONTENT_CLASS =
  "max-w-full [&_*]:max-w-full [&_*]:!whitespace-pre-wrap [&_*]:break-words [&_img]:h-auto [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_td]:break-words [&_td]:align-top [&_td]:border [&_td]:border-slate-300 [&_td]:px-2 [&_td]:py-1 [&_th]:break-words [&_th]:align-top [&_th]:border [&_th]:border-slate-300 [&_th]:px-2 [&_th]:py-1 [&_div:not([data-signature-stamp])]:min-h-[1.8em]";

const contentStyle = (fontSize: number): React.CSSProperties => ({
  fontFamily: "Times New Roman, serif",
  fontSize,
  lineHeight: "1.8",
  color: "#1e293b",
  maxWidth: "100%",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
});

const ATOMIC = new Set(["TABLE", "IMG", "FIGURE", "SVG", "VIDEO", "CANVAS"]);

const BLOCK_TAGS = new Set([
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
  "HEADER",
  "FOOTER",
  "ASIDE",
  "NAV",
  "TR",
  "THEAD",
  "TBODY",
]);

export const PreviewModal = ({
  editorHtml,
  pages: providedPages,
  stamp: providedStamp,
  orientation,
  fontSize = 14,
  onClose,
  stampVisible,
  stampPos,
  stampSize,
  stampSignerName,
  stampCertSerial,
  stampSignedAt,
  stampValidUntil,
  attachments,
}: {
  subject: string;
  editorHtml: string;
  pages?: string[];
  stamp?: {
    pageIndex: number;
    x: number;
    y: number;
    width: string;
    html?: string;
  } | null;
  orientation: PageOrientation;
  fontSize?: number;
  onClose: () => void;
  stampVisible: boolean;
  stampPos: { x: number; y: number };
  stampSize: { width: number; height: "auto" | number };
  stampSignerName: string;
  stampCertSerial: string;
  stampSignedAt: string;
  stampValidUntil: string;
  attachments?: AttachedFile[];
}) => {
  const isLandscape = orientation === "landscape";
  const pageWidth = isLandscape ? 1122 : 794;
  const pageHeight = isLandscape ? 794 : 1122;
  const contentWidth = pageWidth - PAGE_PAD_H * 2;
  const contentHeight = pageHeight - PAGE_PAD_V * 2;
  const CONTENT_STYLE = contentStyle(fontSize);

  const measureRef = useRef<HTMLDivElement>(null);
  // Вьюпорт прокрутки — нужен, чтобы «По размеру» считал зум по реальной
  // доступной области, а не по приблизительной window.innerHeight.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAttachments, setShowAttachments] = useState(false);

  // Стейт для унифицированного штампа ЭЦП (как для плейсхолдера, так и для вшитого)
  const [activeStamp, setActiveStamp] = useState<{
    pageIndex: number;
    x: number;
    y: number;
    width: string;
    html?: string;
  } | null>(null);

  useLayoutEffect(() => {
    const measurer = measureRef.current;
    if (!measurer) return;

    if (!editorHtml || !editorHtml.replace(/<[^>]*>/g, "").trim()) {
      setPages([]);
      setActiveStamp(null);
      return;
    }

    const source = document.createElement("div");
    source.innerHTML = editorHtml;
    source.querySelectorAll("[data-page-spacer]").forEach((n) => n.remove());

    const PAGE_STRIDE = pageHeight + PAGE_GAP;
    let detectedStamp = null;

    // 1. Ищем и изолируем встроенный в HTML штамп ЭЦП (если документ уже подписан)
    const stampNode = source.querySelector<HTMLElement>(
      "[data-signature-stamp='true']",
    );
    if (stampNode) {
      const left = parseFloat(stampNode.style.left) || 0;
      const top = parseFloat(stampNode.style.top) || 0;
      const width = stampNode.style.width || "377px";

      const pageIndex = Math.max(0, Math.floor(top / PAGE_STRIDE));
      const localY = top - pageIndex * PAGE_STRIDE;

      detectedStamp = {
        pageIndex,
        x: left,
        y: localY,
        width,
        html: stampNode.innerHTML,
      };
      stampNode.remove(); // Вырезаем из потока текста, чтобы не ломать пагинацию страниц
    }

    // 2. Если вшитого штампа нет, но активен плавающий плейсхолдер ЭЦП до подписания
    if (!detectedStamp && stampVisible) {
      const pageIndex = Math.max(0, Math.floor(stampPos.y / PAGE_STRIDE));
      const localY = stampPos.y - pageIndex * PAGE_STRIDE;

      detectedStamp = {
        pageIndex,
        x: stampPos.x,
        y: localY,
        width:
          typeof stampSize.width === "number"
            ? `${stampSize.width}px`
            : stampSize.width,
      };
    }

    setActiveStamp(detectedStamp);

    // Если страницы уже разложены редактором — используем их как есть, чтобы
    // предпросмотр был визуально идентичен холсту. Собственную разбивку ниже
    // оставляем как запасной вариант (когда pages не переданы).
    if (providedPages && providedPages.length) {
      // Штамп берём из того же источника, что и страницы — гарантированно
      // совпадает с холстом (и виден на своей странице).
      setActiveStamp(providedStamp ?? null);
      setPages(providedPages);
      setCurrentPage(0);
      return;
    }

    // Разделение контента на страницы
    const blocks: HTMLElement[] = [];
    let inlineBuf: Node[] = [];
    const flushInline = () => {
      if (!inlineBuf.length) return;
      const div = document.createElement("div");
      inlineBuf.forEach((n) => div.appendChild(n));
      if ((div.textContent || "").trim() || div.querySelector("img,br")) {
        blocks.push(div);
      }
      inlineBuf = [];
    };
    Array.from(source.childNodes).forEach((node) => {
      const isBlockEl =
        node.nodeType === Node.ELEMENT_NODE &&
        BLOCK_TAGS.has((node as HTMLElement).tagName);
      if (isBlockEl) {
        flushInline();
        blocks.push(node as HTMLElement);
      } else {
        inlineBuf.push(node);
      }
    });
    flushInline();

    const result: string[] = [];
    measurer.innerHTML = "";
    const fits = () => measurer.scrollHeight <= contentHeight;
    const flush = () => {
      if (measurer.innerHTML.trim()) {
        result.push(measurer.innerHTML);
        measurer.innerHTML = "";
      }
    };

    const splitOversized = (el: HTMLElement) => {
      const full = el.textContent || "";
      const n = full.length;
      let start = 0;
      let guard = 0;
      while (start < n && guard++ < 5000) {
        measurer.innerHTML = "";
        const chunk = el.cloneNode(false) as HTMLElement;
        measurer.appendChild(chunk);

        let lo = start + 1;
        let hi = n;
        let best = start + 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          chunk.textContent = full.slice(start, mid);
          if (fits()) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        chunk.textContent = full.slice(start, best);
        result.push(measurer.innerHTML);
        measurer.innerHTML = "";
        start = best;
      }
    };

    for (const block of blocks) {
      if (block.hasAttribute("data-page-break")) {
        if (measurer.innerHTML.trim()) flush();
        else result.push("<div><br></div>");
        continue;
      }

      const clone = block.cloneNode(true) as HTMLElement;
      measurer.appendChild(clone);

      if (fits()) continue;

      if (measurer.childNodes.length > 1) {
        measurer.removeChild(clone);
        flush();
        measurer.appendChild(clone);
        if (fits()) continue;
      }

      const tag = clone.tagName;
      if (!ATOMIC.has(tag) && (clone.textContent || "").trim()) {
        measurer.removeChild(clone);
        splitOversized(clone);
      }
    }

    flush();
    setPages(result.length ? result : [source.innerHTML]);
    setCurrentPage(0);
  }, [
    editorHtml,
    providedPages,
    providedStamp,
    contentHeight,
    contentWidth,
    orientation,
    fontSize,
    stampVisible,
    stampPos,
    stampSize,
  ]);

  const sheets = pages.length ? pages : [""];
  // Готовые страницы из редактора отрисовываем как есть (блоки спозиционированы
  // абсолютно), без собственных полей/перетекания.
  const usingProvidedPages = !!(providedPages && providedPages.length);

  // «По размеру»: подгоняем лист так, чтобы он ЦЕЛИКОМ помещался в видимую
  // область прокрутки (и по ширине, и по высоте). Считаем по реальным размерам
  // вьюпорта за вычетом внутренних полей и округляем ВНИЗ — иначе лист на пару
  // пикселей вылезает за край и появляется лишний скролл при полном размере.
  const zoomToFit = () => {
    const vp = scrollRef.current;
    const PAD = 40; // p-4 контейнера (16px×2) + небольшой запас по краям
    const availW = (vp?.clientWidth ?? window.innerWidth) - PAD;
    const availH = (vp?.clientHeight ?? window.innerHeight - 160) - PAD;
    if (availW <= 0 || availH <= 0) return;
    const fitZoom = Math.min(availW / pageWidth, availH / pageHeight);
    setZoom(Math.max(0.3, Math.min(1.5, Math.floor(fitZoom * 100) / 100)));
  };

  useEffect(() => {
    if (sheets.length) {
      setTimeout(zoomToFit, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheets.length, orientation]);

  const zoomIn = () => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        setCurrentPage((p) => Math.min(sheets.length - 1, p + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentPage((p) => Math.max(0, p - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, sheets.length]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-slate-700/80 backdrop-blur-sm select-none overflow-hidden h-screen w-screen"
        onClick={onClose}
      >
        {/* Скроллбар рабочей области — в тон тёмной модалке: тонкий, скруглённый,
            полупрозрачный, с подсветкой при наведении. */}
        <style>{`
          .preview-scroll { scrollbar-width: thin; scrollbar-color: rgba(148,163,184,0.5) transparent; }
          .preview-scroll::-webkit-scrollbar { width: 12px; height: 12px; }
          .preview-scroll::-webkit-scrollbar-track { background: transparent; }
          .preview-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(148,163,184,0.45);
            border-radius: 9999px;
            border: 3px solid transparent;
            background-clip: content-box;
          }
          .preview-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(203,213,225,0.75); background-clip: content-box; }
          .preview-scroll::-webkit-scrollbar-corner { background: transparent; }
        `}</style>

        {/* Хедер модального окна */}
        <div
          className="flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-800 border-b border-slate-600 h-16"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Eye size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">
                Предварительный просмотр
              </p>
              <p className="text-xs text-slate-400 truncate">
                {isLandscape ? "Альбомная ориентация" : "Книжная ориентация"} ·
                A4 · {sheets.length}{" "}
                {sheets.length === 1
                  ? "страница"
                  : sheets.length < 5
                    ? "страницы"
                    : "страниц"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1 bg-slate-700 border border-slate-600 rounded-xl px-1 py-1">
              <button
                onClick={zoomOut}
                className="p-1.5 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
                title="Уменьшить"
              >
                <ZoomOut size={15} />
              </button>
              <span className="px-2 text-xs font-semibold text-slate-200 tabular-nums min-w-[44px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-1.5 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
                title="Увеличить"
              >
                <ZoomIn size={15} />
              </button>
              <div className="w-px h-4 bg-slate-600 mx-1" />
              <button
                onClick={zoomToFit}
                className="p-1.5 rounded-lg text-slate-200 hover:bg-slate-600 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                title="Подогнать под размер экрана"
              >
                <Maximize2 size={14} />
                <span className="hidden md:inline">По размеру</span>
              </button>
            </div>

            <If is={attachments !== undefined && attachments.length > 0}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAttachments(!showAttachments)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer select-none",
                    showAttachments && "bg-slate-600 border-slate-500"
                  )}
                >
                  <Paperclip size={14} className="text-blue-400" />
                  <span className="hidden md:inline">Вложения</span>
                  <span className="flex items-center justify-center bg-blue-500/20 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {attachments!.length}
                  </span>
                </button>
                
                <AnimatePresence>
                  <If is={showAttachments}>
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3 font-sans"
                    >
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Список вложений ({attachments!.length})
                      </p>
                      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                        {attachments!.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center gap-3 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-xs text-slate-200"
                          >
                            <Paperclip size={14} className="text-blue-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold truncate text-slate-100" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-400">{file.size}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </If>
                </AnimatePresence>
              </div>
            </If>

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <X size={15} />
              <span className="hidden sm:inline">Закрыть</span>
            </button>
          </div>
        </div>

        {/* Рабочая область */}
        <div
          className="flex-1 flex flex-col justify-between items-center py-4 overflow-hidden bg-slate-900/10"
          onClick={() => {
            if (showAttachments) setShowAttachments(false);
            else onClose();
          }}
        >
          <div
            ref={scrollRef}
            className="preview-scroll flex-1 w-full overflow-auto p-4 flex"
            onClick={(e) => {
              e.stopPropagation();
              if (showAttachments) setShowAttachments(false);
            }}
          >
            <div
              style={{
                width: pageWidth * zoom,
                height: pageHeight * zoom,
                margin: "auto",
                flexShrink: 0,
                transition: "width 0.1s ease-out, height 0.1s ease-out",
              }}
            >
              <div
                style={{
                  width: pageWidth,
                  height: pageHeight,
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  transition: "transform 0.1s ease-out",
                }}
              >
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white shadow-2xl border border-slate-300 w-full h-full"
                  style={{
                    padding: usingProvidedPages
                      ? 0
                      : `${PAGE_PAD_V}px ${PAGE_PAD_H}px`,
                    position: "relative",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  {usingProvidedPages ? (
                    <div
                      className={CONTENT_CLASS}
                      style={{
                        ...CONTENT_STYLE,
                        position: "absolute",
                        inset: 0,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: sheets[currentPage] || "",
                      }}
                    />
                  ) : sheets[currentPage] ? (
                    <div
                      className={CONTENT_CLASS}
                      style={{ ...CONTENT_STYLE, height: "100%" }}
                      dangerouslySetInnerHTML={{ __html: sheets[currentPage] }}
                    />
                  ) : (
                    <p
                      style={{
                        ...CONTENT_STYLE,
                        color: "#94a3b8",
                        fontStyle: "italic",
                      }}
                    >
                      Текст письма не введён...
                    </p>
                  )}

                  {activeStamp && activeStamp.pageIndex === currentPage && (
                    <div
                      style={{
                        position: "absolute",
                        left: PAGE_PAD_H + activeStamp.x,
                        top: PAGE_PAD_V + activeStamp.y,
                        width: activeStamp.width,
                        height: "auto",
                        overflow: "hidden",
                        pointerEvents: "none",
                        zIndex: 50,
                      }}
                    >
                      {activeStamp.html ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: activeStamp.html }}
                        />
                      ) : (
                        <DSStamp
                          name={stampSignerName}
                          certSerial={stampCertSerial}
                          signedAt={stampSignedAt}
                          validUntil={stampValidUntil}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Пагинация */}
          <div
            className="flex-shrink-0 flex items-center gap-4 bg-slate-800 border border-slate-600 px-4 py-2 rounded-2xl shadow-xl z-10 my-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded-xl text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="text-sm font-semibold text-slate-200 min-w-[100px] text-center tabular-nums">
              Страница {currentPage + 1} из {sheets.length}
            </span>

            <button
              disabled={currentPage === sheets.length - 1}
              onClick={() =>
                setCurrentPage((p) => Math.min(sheets.length - 1, p + 1))
              }
              className="p-1.5 rounded-xl text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Скрытый измеритель */}
        <div
          ref={measureRef}
          aria-hidden
          className={CONTENT_CLASS}
          style={{
            ...CONTENT_STYLE,
            position: "absolute",
            top: 0,
            left: -99999,
            width: contentWidth,
            visibility: "hidden",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};
