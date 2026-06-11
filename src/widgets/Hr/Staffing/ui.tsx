import { useState } from "react";
import {
  Network,
  FileUp,
  Search,
  List,
  LayoutGrid,
  GitBranch,
  Workflow,
  Plus,
} from "lucide-react";
import { IStaffOrganization, TStaffingView } from "./model";

// Переключатели вида структуры
const VIEWS: { key: TStaffingView; icon: React.ReactNode; title: string }[] = [
  { key: "list", icon: <List size={16} />, title: "Список" },
  { key: "grid", icon: <LayoutGrid size={16} />, title: "Сетка" },
  { key: "tree", icon: <GitBranch size={16} />, title: "Дерево" },
  { key: "chart", icon: <Workflow size={16} />, title: "Оргсхема" },
];

// Виджет «Штатное расписание»: структура организаций, отделов и должностей
export const StaffingWidget: React.FC = () => {
  const [view, setView] = useState<TStaffingView>("list");
  const [search, setSearch] = useState("");
  // Пока данных нет — логику подключим позже
  const [organizations] = useState<IStaffOrganization[]>([]);

  const orgCount = organizations.length;
  const positionsCount = organizations.reduce((s, o) => s + (o.positionsCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Шапка раздела */}
      <div className="flex items-start justify-between gap-3 flex-wrap bg-white border border-slate-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white flex-shrink-0">
            <Network size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Штатное расписание</h2>
            <p className="text-sm text-slate-400">
              Управление структурой организаций, отделов и должностей
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <FileUp size={15} /> Прикрепить PDF
        </button>
      </div>

      {/* Тулбар */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск организаций, отделов..."
              className="pl-9 pr-3 py-2 w-64 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                title={v.title}
                className={`p-1.5 rounded-lg transition-colors ${
                  view === v.key ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {v.icon}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {orgCount} орг. · {positionsCount} должн.
          </span>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={16} /> Организация
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="bg-white border border-slate-200 rounded-2xl">
        {orgCount === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-5 relative">
              <Network size={32} className="text-slate-300" />
              <span className="absolute -bottom-1 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                <Plus size={15} />
              </span>
            </div>
            <p className="text-base font-bold text-slate-700">Структура пустая</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs">
              Добавьте первую организацию, чтобы начать формирование штатного расписания
            </p>
            <button className="mt-5 flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
              <Plus size={16} /> Добавить организацию
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
