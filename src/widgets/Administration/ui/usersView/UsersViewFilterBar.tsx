import * as React from "react";
import { X, Check, Search } from "lucide-react";
import { Select } from "antd";
import { T, getRoleColor } from "../../theme/tokens";

interface IProps {
  searchValue: string;
  onSearchValueChange: (val: string) => void;
  onApplySearch: (val: string) => void;
  onClearSearch: () => void;
  chipFilter: string | null;
  onChipFilterChange: (val: string | null) => void;
  departmentFilter: string | null;
  onDepartmentFilterChange: (val: string | null) => void;
  statusFilter: string | null;
  onStatusFilterChange: (val: string | null) => void;
  allRoleNames: string[];
  departments: { id: number; name: string }[];
  chipFilters: { label: string; filter: string | null }[];
}

export function UsersViewFilterBar({
  searchValue,
  onSearchValueChange,
  onApplySearch,
  onClearSearch,
  chipFilter,
  onChipFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  allRoleNames,
  departments,
  chipFilters,
}: IProps) {
  return (
    <>
      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-[10px] px-4 py-3.5 flex flex-wrap items-center gap-3 shadow-xs">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 w-full sm:w-60 h-9">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            className="admin__search-input w-full border-0 outline-none bg-transparent text-[13px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            placeholder="Поиск сотрудника..."
            value={searchValue}
            onChange={(e) => onSearchValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onApplySearch(searchValue);
            }}
            style={{ fontFamily: T.font }}
          />
          {searchValue && (
            <>
              <button
                onClick={onClearSearch}
                className="bg-transparent border-0 cursor-pointer flex p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={14} />
              </button>
              <button
                onClick={() => onApplySearch(searchValue)}
                className="bg-transparent border-0 cursor-pointer flex p-0 text-blue-500 hover:text-blue-600"
              >
                <Check size={14} />
              </button>
            </>
          )}
        </div>
        <Select
          value={chipFilter || ""}
          onChange={(v) => onChipFilterChange(v || null)}
          className="w-full sm:w-[180px]"
          style={{ height: 36 }}
          options={[
            { value: "", label: "Все роли" },
            ...allRoleNames.map((role) => ({ value: role, label: role })),
          ]}
        />

        <Select
          value={departmentFilter || ""}
          onChange={(v) => onDepartmentFilterChange(v || null)}
          className="w-full sm:w-[200px]"
          style={{ height: 36 }}
          options={[
            { value: "", label: "Все отделы" },
            ...departments.map((d) => ({ value: d.name, label: d.name })),
          ]}
        />

        <Select
          value={statusFilter || ""}
          onChange={(v) => onStatusFilterChange(v || null)}
          className="w-full sm:w-[160px]"
          style={{ height: 36 }}
          options={[
            { value: "", label: "Все статусы" },
            { value: "active", label: "Активен" },
            { value: "inactive", label: "Неактивен" },
            { value: "blocked", label: "Заблокирован" },
            { value: "vacation", label: "В отпуске" },
            { value: "business_trip", label: "В командировке" },
          ]}
        />
      </div>

      {/* Role filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {chipFilters.map((chip) => {
          const isActive = chip.filter === chipFilter;
          const cfg = chip.filter ? getRoleColor(chip.filter) : null;
          return (
            <button
              key={chip.label}
              onClick={() => onChipFilterChange(chip.filter)}
              className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium cursor-pointer whitespace-nowrap shrink-0 transition-all border ${
                isActive
                  ? ""
                  : "bg-white/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80"
              }`}
              style={{
                fontFamily: T.font,
                ...(isActive
                  ? {
                      borderColor: cfg?.text ?? T.accent,
                      background: cfg?.bg ?? "#EFF6FF",
                      color: cfg?.text ?? T.accent,
                    }
                  : {}),
              }}
            >
              {cfg && (
                <span
                  className="w-1.5 h-1.5 rounded-full inline-block"
                  style={{ background: cfg.text }}
                />
              )}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
