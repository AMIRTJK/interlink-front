import { Clock } from "lucide-react";

// Шапка режима сравнения версий. Постраничной навигации здесь нет намеренно:
// сравниваемая версия выводится всеми листами сразу, напротив соответствующих
// страниц актуальной версии, и листается общей прокруткой страницы.
interface IProps {
  latestVersionNumber?: number;
  activeVersionNumber?: number;
  activeVersionDate?: string;
  versionCompareTotal: number;
}

export const VersionComparePagerBar = ({
  latestVersionNumber,
  activeVersionNumber,
  activeVersionDate,
  versionCompareTotal,
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
    <span className="text-xs font-semibold text-slate-600 tabular-nums whitespace-nowrap shrink-0">
      Страниц: {versionCompareTotal}
    </span>
  </div>
);
