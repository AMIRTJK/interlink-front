import {
  contentStyle,
  CONTENT_CLASS,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_GAP,
  PAGE_STRIDE,
  PAGE_PAD_H,
  PAGE_PAD_V,
  type StampInfo,
} from "../../InternalCorrespondenceIncomingView/lib";

// Правый холст режима «Просмотр истории версий»: сравниваемая версия целиком,
// колонкой листов.
//
// Ключевое требование режима — постраничное совмещение с основным холстом:
// страница N сравниваемой версии должна стоять ровно напротив страницы N
// актуальной. Поэтому колонка повторяет геометрию основного холста один в один
// (тот же PAGE_STRIDE, те же листы в absolute-потоке) и НИКАК не смещается при
// прокрутке. Любой sticky/transform здесь сдвигает листы относительно левых и
// ломает сравнение, а собственная прокрутка внутри холста заставляет
// пользователя листать два документа по отдельности.

interface IProps {
  sheets: string[];
  stamp: StampInfo;
  fontSize?: number;
}

export const VersionCompareCanvas = ({
  sheets,
  stamp,
  fontSize = 14,
}: IProps) => {
  const total = Math.max(sheets.length, 1);

  return (
    <div
      style={{
        position: "relative",
        width: PAGE_WIDTH,
        height: total * PAGE_STRIDE - PAGE_GAP,
      }}
    >
      {sheets.length ? (
        sheets.map((pageHtml, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top: index * PAGE_STRIDE,
              left: 0,
              width: PAGE_WIDTH,
              height: PAGE_HEIGHT,
              padding: `${PAGE_PAD_V}px ${PAGE_PAD_H}px`,
              background: "#ffffff",
              border: "1px solid rgba(148, 163, 184, 0.35)",
              boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)",
              borderRadius: 16,
              boxSizing: "border-box",
            }}
          >
            <div
              className={CONTENT_CLASS}
              style={{ ...contentStyle(fontSize), height: "100%" }}
              onDragStart={(e) => e.preventDefault()}
              dangerouslySetInnerHTML={{ __html: pageHtml }}
            />

            {/* Рисунок ЭЦП живёт на своей странице версии */}
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
              Страница {index + 1} из {total}
            </span>
          </div>
        ))
      ) : (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            background: "#ffffff",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            boxShadow: "0 18px 60px rgba(15, 23, 42, 0.08)",
            borderRadius: 16,
            boxSizing: "border-box",
          }}
        >
          <p className="text-slate-400 italic text-center py-10">
            Контент документа отсутствует...
          </p>
        </div>
      )}
    </div>
  );
};
