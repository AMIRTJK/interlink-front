import React, { useEffect, useRef } from "react";
import {
  contentStyle,
  CONTENT_CLASS,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_PAD_H,
  PAGE_PAD_V,
  type StampInfo,
} from "../../InternalCorrespondenceIncomingView/lib";

// Левый A4-холст режима «Просмотр входящего письма» при «Ответить»/
// «Перенаправить». Показывает ОДНУ страницу исходного входящего письма 1-в-1
// как на странице просмотра документа (DocumentCanvas): та же постраничная
// разбивка, то же оформление контента и рисунок ЭЦП на своей странице.
// Разбивку на страницы и пагинацию считает родитель (закреплённая панель над
// холстами) — сюда приходят готовые страницы и номер текущей.
//
// Холст строго read-only. В режиме fitToViewport (исходящее письмо занимает
// больше одной страницы и страница получает прокрутку) холст ограничивается
// высотой окна и становится «окном» с собственной вертикальной прокруткой —
// так любую часть страницы можно рассмотреть в полном размере, не прокручивая
// саму страницу. Если исходящее умещается на одном листе, ограничение не
// нужно: оба холста A4 одинаковой высоты и выровнены друг с другом.

interface IProps {
  sheets: string[];
  stamp: StampInfo;
  page: number;
  fitToViewport?: boolean;
  fontSize?: number;
}

export const OriginalLetterCanvas = ({
  sheets,
  stamp,
  page,
  fitToViewport = false,
  fontSize = 14,
}: IProps) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const total = Math.max(sheets.length, 1);
  const current = Math.min(page, total - 1);

  // При переключении страницы возвращаем внутреннюю прокрутку к началу листа.
  useEffect(() => {
    windowRef.current?.scrollTo({ top: 0 });
  }, [current]);

  return (
    <div
      ref={windowRef}
      // Кастомный тонкий скроллбар: прозрачный трек с отступами от углов, чтобы
      // не перекрывать скругление листа, и узкий «пилюльный» ползунок — визуально
      // отличается от системного скроллбара страницы.
      className="bg-white border border-slate-300/40 shadow-xl shrink-0 [&::-webkit-scrollbar]:w-[7px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:my-4 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/70 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400/80"
      style={{
        width: PAGE_WIDTH,
        // 88px = верхний отступ под закреплённой панелью пагинации (64) +
        // нижний отступ (24) — согласовано со sticky-логикой родителя.
        maxHeight: fitToViewport ? "calc(100vh - 88px)" : undefined,
        borderRadius: 16,
        boxSizing: "border-box",
        overflowY: fitToViewport ? "auto" : "hidden",
        overflowX: "hidden",
      }}
    >
      {/* Полный лист A4 — размеры и оформление 1-в-1 с просмотром входящего */}
      <div
        style={{
          position: "relative",
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          padding: `${PAGE_PAD_V}px ${PAGE_PAD_H}px`,
          boxSizing: "border-box",
        }}
      >
        {sheets.length ? (
          <div
            className={CONTENT_CLASS}
            style={{ ...contentStyle(fontSize), height: "100%" }}
            onDragStart={(e) => e.preventDefault()}
            dangerouslySetInnerHTML={{ __html: sheets[current] || "" }}
          />
        ) : (
          <p className="text-slate-400 italic text-center py-10">
            Контент документа отсутствует...
          </p>
        )}

        {/* Рисунок ЭЦП на своей странице */}
        {stamp && stamp.pageIndex === current && stamp.html && (
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
          Страница {current + 1} из {total}
        </span>
      </div>
    </div>
  );
};
