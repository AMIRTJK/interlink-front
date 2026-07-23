import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X } from "lucide-react";
import {
  paginateHtml,
  contentStyle,
  CONTENT_CLASS,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_PAD_H,
  PAGE_PAD_V,
  PAGE_GAP,
  type StampInfo,
} from "./lib";

// Read-only постраничный рендер тела письма для просмотра входящего.
// Разбивку и позиционирование штампа считает paginateHtml (см. ./lib), чтобы
// входящее письмо выглядело 1-в-1 как исходящее: видны разделения страниц A4 и
// рисунок ЭЦП на своей странице.
export const DocumentCanvas = ({
  html,
  fontSize = 14,
}: {
  html?: string | null;
  fontSize?: number;
}) => {
  const [pages, setPages] = useState<string[]>([]);
  const [stamp, setStamp] = useState<StampInfo>(null);

  // Просмотр вшитого штампа ЭЦП в полном размере — поведение 1-в-1 с исходящим
  // письмом: по клику берём src картинки штампа и показываем крупно в модалке.
  const [zoomedStampSrc, setZoomedStampSrc] = useState<string | null>(null);

  useLayoutEffect(() => {
    const result = paginateHtml(html, fontSize);
    setPages(result.pages);
    setStamp(result.stamp);
  }, [html, fontSize]);

  useEffect(() => {
    if (!zoomedStampSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomedStampSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomedStampSrc]);

  // Страница со штампом должна существовать, даже если на ней нет текста.
  const sheets = [...pages];
  if (stamp) while (sheets.length <= stamp.pageIndex) sheets.push("");

  if (!sheets.length) {
    return (
      <p className="text-slate-400 italic text-center py-10">
        Контент документа отсутствует...
      </p>
    );
  }

  return (
    <>
      <div
        className="flex flex-col items-center w-full"
        style={{ gap: PAGE_GAP }}
      >
        {sheets.map((pageHtml, index) => (
          <div
            key={index}
            className="bg-white border border-slate-300/40 shadow-xl"
            style={{
              position: "relative",
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: `${PAGE_PAD_V}px ${PAGE_PAD_H}px`,
              borderRadius: 16,
              boxSizing: "border-box",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              className={CONTENT_CLASS}
              style={{ ...contentStyle(fontSize), height: "100%" }}
              dangerouslySetInnerHTML={{ __html: pageHtml }}
            />

            {/* Рисунок ЭЦП на своей странице. Кликабелен — открывает подпись в
                полном размере, как в исходящем письме. */}
            {stamp && stamp.pageIndex === index && stamp.html && (
              <div
                onClick={(e) => {
                  const src = e.currentTarget
                    .querySelector("img")
                    ?.getAttribute("src");
                  if (src) setZoomedStampSrc(src);
                }}
                title="Нажмите, чтобы посмотреть в полном размере"
                style={{
                  position: "absolute",
                  left: PAGE_PAD_H + stamp.x,
                  top: PAGE_PAD_V + stamp.y,
                  width: stamp.width,
                  height: "auto",
                  overflow: "hidden",
                  cursor: "zoom-in",
                  zIndex: 50,
                }}
                dangerouslySetInnerHTML={{ __html: stamp.html }}
              />
            )}

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
              Страница {index + 1} из {sheets.length}
            </span>
          </div>
        ))}
      </div>

      {/* Просмотр вшитого штампа ЭЦП в полном размере. Портал в body — чтобы
          fixed-оверлей не смещался transform'ами предков. Закрытие — по фону,
          крестику или Escape. */}
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
    </>
  );
};
