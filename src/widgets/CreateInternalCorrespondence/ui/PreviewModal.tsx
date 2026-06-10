import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { PageOrientation } from "../types";
import { DSStamp } from "./DSStamp";

const PAGE_PAD = 96; // поля A4 (~2.54см)
const PAGE_GAP = 32; // отступ между листами
const CONTENT_CLASS =
  "max-w-full [&_*]:max-w-full [&_*]:break-words [&_img]:h-auto [&_table]:w-full [&_table]:table-fixed [&_td]:break-words [&_pre]:whitespace-pre-wrap";

const CONTENT_STYLE: React.CSSProperties = {
  fontFamily: "Times New Roman, serif",
  fontSize: 14,
  lineHeight: 2,
  color: "#1e293b",
  maxWidth: "100%",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
};

// Элементы, которые нельзя разрывать между страницами
const ATOMIC = new Set(["TABLE", "IMG", "FIGURE", "SVG", "VIDEO", "CANVAS"]);

// Блочные элементы — каждый считается отдельной единицей при разбивке
const BLOCK_TAGS = new Set([
  "DIV", "P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI",
  "TABLE", "BLOCKQUOTE", "PRE", "FIGURE", "HR", "SECTION", "ARTICLE",
  "HEADER", "FOOTER", "ASIDE", "NAV", "TR", "THEAD", "TBODY",
]);

export const PreviewModal = ({
  editorHtml,
  orientation,
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
  const contentWidth = pageWidth - PAGE_PAD * 2;
  const contentHeight = pageHeight - PAGE_PAD * 2;

  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);

  // Разбиение HTML на страницы A4 с измерением реальной высоты блоков
  useLayoutEffect(() => {
    const measurer = measureRef.current;
    if (!measurer) return;

    if (!editorHtml || !editorHtml.replace(/<[^>]*>/g, "").trim()) {
      setPages([]);
      return;
    }

    const source = document.createElement("div");
    source.innerHTML = editorHtml;

    // 1. Нормализация: «голый» текст и инлайн-узлы заворачиваем в блок <div>,
    //    чтобы каждый верхнеуровневый элемент можно было измерить и разбить.
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

    // Разбивка блока, который сам по себе выше страницы. Делим по позиции
    // символов через бинарный поиск — работает и для текста без пробелов.
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

    // 2. Раскладка блоков по страницам
    for (const block of blocks) {
      const clone = block.cloneNode(true) as HTMLElement;
      measurer.appendChild(clone);

      if (fits()) continue;

      // Не помещается. Если на странице уже что-то есть — переносим блок целиком.
      if (measurer.childNodes.length > 1) {
        measurer.removeChild(clone);
        flush();
        measurer.appendChild(clone);
        if (fits()) continue;
      }

      // Блок один на странице и всё равно не влезает.
      const tag = clone.tagName;
      if (!ATOMIC.has(tag) && (clone.textContent || "").trim()) {
        measurer.removeChild(clone);
        splitOversized(clone);
      }
      // Атомарные элементы (таблицы/картинки) оставляем — займут свою страницу.
    }

    flush();
    setPages(result.length ? result : [editorHtml]);
  }, [editorHtml, contentHeight, contentWidth, orientation]);

  const zoomIn = () => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)));
  const zoomReset = () => setZoom(1);

  // Esc для закрытия
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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

  const sheets = pages.length ? pages : [""];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-slate-700/80 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Хедер */}
        <div
          className="flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-800 border-b border-slate-600"
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
            {/* Зум */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-700 border border-slate-600 rounded-xl px-1 py-1">
              <button
                onClick={zoomOut}
                className="p-1.5 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
                title="Уменьшить"
              >
                <ZoomOut size={15} />
              </button>
              <button
                onClick={zoomReset}
                className="px-2 text-xs font-semibold text-slate-200 hover:text-white tabular-nums min-w-[44px]"
                title="Сбросить масштаб"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={zoomIn}
                className="p-1.5 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
                title="Увеличить"
              >
                <ZoomIn size={15} />
              </button>
              <button
                onClick={zoomReset}
                className="p-1.5 rounded-lg text-slate-200 hover:bg-slate-600 transition-colors"
                title="По размеру"
              >
                <Maximize2 size={14} />
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

        {/* Лента страниц */}
        <div
          className="flex-1 overflow-auto py-10 px-4 sm:px-8"
          onClick={onClose}
        >
          <div
            className="flex flex-col items-center"
            style={{ gap: PAGE_GAP, zoom }}
            onClick={(e) => e.stopPropagation()}
          >
            {sheets.map((html, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.97, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut", delay: index * 0.03 }}
                className="bg-white shadow-2xl border border-slate-300 flex-shrink-0"
                style={{
                  width: pageWidth,
                  height: pageHeight,
                  padding: PAGE_PAD,
                  position: "relative",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                {/* Номер страницы */}
                <span
                  style={{
                    position: "absolute",
                    bottom: 24,
                    right: PAGE_PAD,
                    fontSize: 11,
                    color: "#94a3b8",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {index + 1} / {sheets.length}
                </span>

                {html ? (
                  <div
                    className={CONTENT_CLASS}
                    style={{ ...CONTENT_STYLE, height: "100%" }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ) : (
                  <p style={{ ...CONTENT_STYLE, color: "#94a3b8", fontStyle: "italic" }}>
                    Текст письма не введён...
                  </p>
                )}

                {renderStamp(index)}
              </motion.div>
            ))}
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
