import { Clock, Users } from "lucide-react";

import { If } from "@shared/ui";

import {
  AuthorshipLegend,
  type IAuthorshipLegendItem,
} from "../authorship";

// Шапка режима истории версий. Постраничной навигации здесь нет намеренно:
// правая колонка выводится всеми листами сразу, напротив соответствующих
// страниц слева, и листается общей прокруткой страницы.
interface IProps {
  latestVersionNumber?: number;
  activeVersionNumber?: number;
  activeVersionDate?: string;
  versionCompareTotal: number;
  showAuthorship: boolean;
  authorshipLegend: IAuthorshipLegendItem[];
}

export const VersionComparePagerBar = ({
  latestVersionNumber,
  activeVersionNumber,
  activeVersionDate,
  versionCompareTotal,
  showAuthorship,
  authorshipLegend,
}: IProps) => (
  <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white border-b border-slate-200 shadow-sm font-sans">
    <If is={!showAuthorship}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
        <Clock size={14} className="text-amber-500" />
        <span>
          История версий — Слева: Актуальная версия №{latestVersionNumber}
          {" • "}
          Справа: Версия №{activeVersionNumber}
          {activeVersionDate ? ` (${new Date(activeVersionDate).toLocaleDateString("ru-RU")})` : ""}
        </span>
      </div>
    </If>

    <If is={showAuthorship}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
          <Users size={14} className="text-blue-500" />
          Авторы правок — версия №{activeVersionNumber}
          {activeVersionNumber === latestVersionNumber ? " (актуальная)" : ""}
        </span>
        <AuthorshipLegend authors={authorshipLegend} />
      </div>
    </If>

    <span className="text-xs font-semibold text-slate-600 tabular-nums whitespace-nowrap shrink-0">
      Страниц: {versionCompareTotal}
    </span>
  </div>
);
