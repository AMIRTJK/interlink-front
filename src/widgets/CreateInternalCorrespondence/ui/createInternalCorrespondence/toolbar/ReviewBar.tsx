import { Users } from "lucide-react";

import { If } from "@shared/ui";

import { AuthorshipLegend, type IAuthorshipLegendItem } from "../authorship";

// Шапка режима «Рецензирование»: чья правка каким цветом подсвечена в холсте.
// Второго холста режим не открывает — это дело истории версий, поэтому и шапка
// у него отдельная: обе могут висеть одновременно.
interface IProps {
  versionNumber?: number;
  isLatestVersion: boolean;
  /** В холсте есть правки, которых ещё нет ни в одной версии */
  isStale: boolean;
  authorshipLegend: IAuthorshipLegendItem[];
}

export const ReviewBar = ({
  versionNumber,
  isLatestVersion,
  isStale,
  authorshipLegend,
}: IProps) => (
  <div className="flex items-center justify-between gap-4 px-4 py-2 bg-white border-b border-slate-200 shadow-sm font-sans">
    <div className="flex items-center gap-3 min-w-0">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
        <Users size={14} className="text-blue-500" />
        Рецензирование — версия №{versionNumber}
        {isLatestVersion ? " (актуальная)" : ""}
      </span>
      <If is={!isStale}>
        <AuthorshipLegend authors={authorshipLegend} />
      </If>
    </div>

    <If is={isStale}>
      <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
        Подсветка обновится после сохранения версии
      </span>
    </If>
  </div>
);
