import { Trash2 } from "lucide-react";

interface IProps {
  index: number;
  pageCount: number;
  pageStride: number;
  pageHeight: number;
  isReadOnly: boolean;
  pageToDelete: number | null;
  deletePage: (index: number) => void;
  setPageToDelete: (index: number | null) => void;
}

export const EditorPageSheet = ({
  index,
  pageCount,
  pageStride,
  pageHeight,
  isReadOnly,
  pageToDelete,
  deletePage,
  setPageToDelete,
}: IProps) => (
  <div
    style={{
      position: "absolute",
      top: index * pageStride,
      left: 0,
      width: "100%",
      height: pageHeight,
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
);
