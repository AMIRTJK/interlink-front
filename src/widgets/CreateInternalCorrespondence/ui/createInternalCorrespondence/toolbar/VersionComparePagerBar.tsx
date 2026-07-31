import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface IProps {
  latestVersionNumber?: number;
  activeVersionNumber?: number;
  activeVersionDate?: string;
  versionCompareCurrent: number;
  versionCompareTotal: number;
  setVersionComparePage: (page: number) => void;
}

export const VersionComparePagerBar = ({
  latestVersionNumber,
  activeVersionNumber,
  activeVersionDate,
  versionCompareCurrent,
  versionCompareTotal,
  setVersionComparePage,
}: IProps) => (
  <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white border-b border-slate-200 shadow-sm font-sans">
    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
      <Clock size={14} className="text-amber-500" />
      <span>
        История версий — Слева: Актуальная версия №{latestVersionNumber}
        {" • "}
        Справа: Версия №{activeVersionNumber}
        {activeVersionDate ? ` (${new Date(activeVersionDate).toLocaleDateString("ru-RU")})` : ""}
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
);
