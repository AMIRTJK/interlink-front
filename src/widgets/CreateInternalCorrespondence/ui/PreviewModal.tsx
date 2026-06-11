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
} from "lucide-react";
import type { PageOrientation } from "../types";
import { DSStamp } from "./DSStamp";

const PAGE_PAD_H = 80;
const PAGE_PAD_V = 72;
const PAGE_GAP = 32;
const CONTENT_CLASS =
  "max-w-full [&_*]:max-w-full [&_*]:!whitespace-pre-wrap [&_*]:break-words [&_img]:h-auto [&_table]:w-full [&_table]:table-fixed [&_td]:break-words [&_div]:min-h-[1.8em]";

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
}: {
  subject: string;
  editorHtml: string;
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
}) => {
  const isLandscape = orientation === "landscape";
  const pageWidth = isLandscape ? 1122 : 794;
  const pageHeight = isLandscape ? 794 : 1122;
  const contentWidth = pageWidth - PAGE_PAD_H * 2;
  const contentHeight = pageHeight - PAGE_PAD_V * 2;
  const CONTENT_STYLE = contentStyle(fontSize);

  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);

  useLayoutEffect(() => {
    const measurer = measureRef.current;
    if (!measurer) return;

    if (!editorHtml || !editorHtml.replace(/<[^>]*>/g, "").trim()) {
      setPages([]);
      return;
    }

    const source = document.createElement("div");
    source.innerHTML = editorHtml;
    source.querySelectorAll("[data-page-spacer]").forEach((n) => n.remove());

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
    setPages(result.length ? result : [editorHtml]);
    setCurrentPage(0);
  }, [editorHtml, contentHeight, contentWidth, orientation, fontSize]);

  const sheets = pages.length ? pages : [""];

  const zoomToFit = () => {
    // Высота контейнера за вычетом хедера и пагинации
    const availableHeight = window.innerHeight - 160;
    const fitZoom = availableHeight / pageHeight;
    setZoom(Math.max(0.4, Math.min(1.5, +fitZoom.toFixed(2))));
  };

  useEffect(() => {
    if (sheets.length) {
      setTimeout(zoomToFit, 50);
    }
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

  const stampPageIndex = Math.max(0, Math.floor(stampPos.y / pageHeight));
  const stampLocalY = stampPos.y - stampPageIndex * pageHeight;

  const renderStamp = (pageIndex: number) =>
    stampVisible && pageIndex === stampPageIndex ? (
      <div
        style={{
          position: "absolute",
          left: stampPos.x,
          top: stampLocalY,
          width: stampSize.width,
          height: stampSize.height === "auto" ? undefined : stampSize.height,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 2,
        }}
      >
        <DSStamp
          name={stampSignerName}
          certSerial={stampCertSerial}
          signedAt={stampSignedAt}
          validUntil={stampValidUntil}
        />
      </div>
    ) : null;

  return (
    <AnimatePresence>
      {/* Главный контейнер модалки теперь СТРОГО overflow-hidden, чтобы убрать уродливый правый внешний скролл */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-slate-700/80 backdrop-blur-sm select-none overflow-hidden h-screen w-screen"
        onClick={onClose}
      >
        {/* Хедер */}
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

            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <X size={15} />
              <span className="hidden sm:inline">Закрыть</span>
            </button>
          </div>
        </div>

        {/* Центральная рабочая область */}
        <div
          className="flex-1 flex flex-col justify-between items-center py-4 overflow-hidden bg-slate-900/10"
          onClick={onClose}
        >
          {/* ОБЛАСТЬ СКРОЛЛА: При зуме >100% скроллбары будут появляться ТОЛЬКО внутри этого контейнера */}
          <div
            className="flex-1 w-full overflow-auto px-4 py-4 flex items-start justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Обертка для корректного расчета скроллбаров при transform: scale. 
                Мы даем контейнеру физические размеры страницы, чтобы браузер знал, когда включать скролл */}
            <div
              style={{
                width: pageWidth,
                height: pageHeight,
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
                transition: "transform 0.1s ease-out",
                // Компенсируем маргины, чтобы при сильном зуме нижняя часть страницы не обрезалась
                marginBottom: zoom > 1 ? `${pageHeight * (zoom - 1)}px` : 0,
                marginRight: zoom > 1 ? `${(pageWidth * (zoom - 1)) / 2}px` : 0,
                marginLeft: zoom > 1 ? `${(pageWidth * (zoom - 1)) / 2}px` : 0,
              }}
              className="flex-shrink-0"
            >
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white shadow-2xl border border-slate-300 w-full h-full"
                style={{
                  padding: `${PAGE_PAD_V}px ${PAGE_PAD_H}px`,
                  position: "relative",
                  boxSizing: "border-box",
                }}
              >
                {sheets[currentPage] ? (
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

                {renderStamp(currentPage)}
              </motion.div>
            </div>
          </div>

          {/* Панель навигации (Пагинация) */}
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

        {/* Скрытый измеритель для пагинации */}
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
