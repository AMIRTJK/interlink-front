import { useLayoutEffect, useState } from "react";
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

  useLayoutEffect(() => {
    const result = paginateHtml(html, fontSize);
    setPages(result.pages);
    setStamp(result.stamp);
  }, [html, fontSize]);

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
    <div className="flex flex-col items-center w-full" style={{ gap: PAGE_GAP }}>
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

          {/* Рисунок ЭЦП на своей странице */}
          {stamp && stamp.pageIndex === index && stamp.html && (
            <div
              style={{
                position: "absolute",
                left: PAGE_PAD_H + stamp.x,
                top: PAGE_PAD_V + stamp.y,
                width: stamp.width,
                height: "auto",
                overflow: "hidden",
                pointerEvents: "none",
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
  );
};
