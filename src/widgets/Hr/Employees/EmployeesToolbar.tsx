import { useState, useRef, useEffect } from "react";
import { Search, SlidersHorizontal, BarChart3, LayoutGrid, Table as TableIcon, Plus, X } from "lucide-react";
import { If } from "@shared/ui";
import { EmployeesFilter } from "./EmployeesFilter";
import { IEmployeesFilters, TEmployeesView } from "./model";

interface IProps {
  search: string;
  onSearch: (v: string) => void;
  view: TEmployeesView;
  onView: (v: TEmployeesView) => void;
  filters: IEmployeesFilters;
  onApplyFilters: (f: IEmployeesFilters) => void;
  departments: { id: number; name: string }[];
  onOpenAnalytics: () => void;
  onCreate: () => void;
}

const emptyFilters: IEmployeesFilters = {
  status: "all",
  department: "all",
  salaryMin: "",
  salaryMax: "",
};

export const EmployeesToolbar = ({
  search,
  onSearch,
  view,
  onView,
  filters,
  onApplyFilters,
  departments,
  onOpenAnalytics,
  onCreate,
}: IProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [draft, setDraft] = useState<IEmployeesFilters>(filters);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openFilter = () => {
    setDraft(filters);
    setShowFilter((v) => !v);
  };

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Поиск..."
            className={`pl-9 ${search ? 'pr-8' : 'pr-4'} py-2.5 w-56 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-th-accent-500/20 transition-colors ui-glass-soft bg-white border-gray-200 text-gray-700 placeholder:text-gray-400 focus:border-th-accent-400 dark:bg-th-raised/90 dark:border-th-high/50 dark:text-slate-100 dark:placeholder:text-slate-500`}
          />
          <If is={!!search}>
            <button
              type="button"
              onClick={() => onSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              aria-label="Очистить поиск"
            >
              <X size={14} />
            </button>
          </If>
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={openFilter}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ui-glass-soft bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-th-raised/90 dark:border-th-high/50 dark:text-slate-300 dark:hover:bg-th-high cursor-pointer"
          >
            <SlidersHorizontal size={15} />
            <span>Фильтр</span>
          </button>
          <If is={showFilter}>
            <EmployeesFilter
              draft={draft}
              setDraft={setDraft}
              departments={departments}
              onApply={() => {
                onApplyFilters(draft);
                setShowFilter(false);
              }}
              onReset={() => {
                setDraft(emptyFilters);
                onApplyFilters(emptyFilters);
                setShowFilter(false);
              }}
            />
          </If>
        </div>

        <button
          onClick={onOpenAnalytics}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-th-accent-600 text-white text-sm font-semibold transition-colors shadow-md shadow-th-accent-900/30 cursor-pointer"
        >
          <BarChart3 size={15} />
          <span>Аналитика</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center ui-glass-soft bg-white border border-slate-200 rounded-xl p-0.5 h-11! dark:bg-th-raised dark:border-th-high">
          <button
            onClick={() => onView("table")}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              view === "table" ? "bg-th-accent-50 text-th-accent-600 dark:bg-th-accent-950/40 dark:text-th-accent-400" : "text-slate-400 hover:text-slate-600"
            }`}
            title="Таблица"
          >
            <TableIcon size={16} />
          </button>
          <button
            onClick={() => onView("cards")}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              view === "cards" ? "bg-th-accent-50 text-th-accent-600 dark:bg-th-accent-950/40 dark:text-th-accent-400" : "text-slate-400 hover:text-slate-600"
            }`}
            title="Карточки"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-th-accent-600 text-white text-sm font-semibold transition-colors shadow-lg shadow-th-accent-900/30 cursor-pointer"
        >
          <Plus size={16} />
          <span>Создать</span>
        </button>
      </div>
    </div>
  );
};
