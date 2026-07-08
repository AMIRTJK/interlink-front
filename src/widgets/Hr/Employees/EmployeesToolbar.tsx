import { useState } from "react";
import { Search, Filter, BarChart3, LayoutGrid, Table as TableIcon, Plus } from "lucide-react";
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

// Панель управления списком: поиск, фильтр, аналитика, вид, создание
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
  const [showFilter, setShowFilter] = useState(false);
  const [draft, setDraft] = useState<IEmployeesFilters>(filters);

  const openFilter = () => {
    setDraft(filters);
    setShowFilter((v) => !v);
  };

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Поиск..."
            className="pl-9 pr-3 py-2 w-56 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="relative">
          <button
            onClick={openFilter}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <Filter size={15} /> Фильтр
          </button>
          {showFilter && (
            <EmployeesFilter
              draft={draft}
              setDraft={setDraft}
              departments={departments}
              onApply={() => {
                onApplyFilters(draft);
                setShowFilter(false);
              }}
              onReset={() => setDraft(emptyFilters)}
            />
          )}
        </div>

        <button
          onClick={onOpenAnalytics}
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <BarChart3 size={15} /> Аналитика
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
          <button
            onClick={() => onView("table")}
            className={`p-1.5 rounded-lg transition-colors ${
              view === "table" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
            title="Таблица"
          >
            <TableIcon size={16} />
          </button>
          <button
            onClick={() => onView("cards")}
            className={`p-1.5 rounded-lg transition-colors ${
              view === "cards" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"
            }`}
            title="Карточки"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} /> Создать
        </button>
      </div>
    </div>
  );
};
