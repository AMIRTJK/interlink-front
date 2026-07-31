import { ChevronLeft, ChevronRight, ExternalLink, Eye } from "lucide-react";

interface IProps {
  sourceId?: number | string | null;
  originalCurrent: number;
  originalTotal: number;
  setOriginalPage: (page: number) => void;
}

export const IncomingPagerBar = ({
  sourceId,
  originalCurrent,
  originalTotal,
  setOriginalPage,
}: IProps) => (
  <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white border-b border-slate-200 shadow-sm font-sans">
    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0">
      <Eye size={14} className="text-amber-500" />
      <span>Входящее письмо — только просмотр</span>
    </div>
    <div className="flex items-center gap-2">
      {sourceId != null && (
        <>
          <button
            type="button"
            onClick={() =>
              window.open(
                `/modules/correspondence/internal/incoming/${sourceId}`,
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
);
