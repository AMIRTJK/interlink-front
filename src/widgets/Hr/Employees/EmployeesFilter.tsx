import { IEmployeesFilters } from "./model";

interface IProps {
  draft: IEmployeesFilters;
  setDraft: (f: IEmployeesFilters) => void;
  departments: { id: number; name: string }[];
  onApply: () => void;
  onReset: () => void;
}

const STATUS_OPTS = [
  { v: "all", l: "Все" },
  { v: "active", l: "Активен" },
  { v: "vacation", l: "В отпуске" },
  { v: "business_trip", l: "В командировке" },
];

const chipCls = (active: boolean) =>
  `px-2.5 py-1 rounded-lg text-xs border transition-colors ${
    active
      ? "bg-blue-50 border-blue-300 text-blue-600"
      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
  }`;

export const EmployeesFilter = ({ draft, setDraft, departments, onApply, onReset }: IProps) => {
  return (
    <div className="absolute z-30 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4">
      <p className="text-sm font-bold text-slate-800 mb-3">Фильтры</p>

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Статус</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {STATUS_OPTS.map((o) => (
          <button
            key={o.v}
            onClick={() => setDraft({ ...draft, status: o.v })}
            className={chipCls(draft.status === o.v)}
          >
            {o.l}
          </button>
        ))}
      </div>

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Отдел</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          onClick={() => setDraft({ ...draft, department: "all" })}
          className={chipCls(draft.department === "all")}
        >
          Все отделы
        </button>
        {departments.map((d) => (
          <button
            key={d.id}
            onClick={() => setDraft({ ...draft, department: String(d.id) })}
            className={chipCls(draft.department === String(d.id))}
          >
            {d.name}
          </button>
        ))}
      </div>

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        Диапазон оклада (₽)
      </p>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={draft.salaryMin}
          onChange={(e) => setDraft({ ...draft, salaryMin: e.target.value })}
          type="number"
          placeholder="От"
          className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"
        />
        <span className="text-slate-400">—</span>
        <input
          value={draft.salaryMax}
          onChange={(e) => setDraft({ ...draft, salaryMax: e.target.value })}
          type="number"
          placeholder="До"
          className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
        >
          Сбросить
        </button>
        <button
          onClick={onApply}
          className="flex-1 px-3 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
        >
          Применить
        </button>
      </div>
    </div>
  );
};
