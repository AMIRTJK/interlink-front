import React from "react";
import { Search } from "lucide-react";
import { Select } from "antd";
import type { IUserAccessFilters } from "../../model";

interface IProps {
  filters: IUserAccessFilters;
  onSearchChange: (search: string) => void;
  onFilterChange: (key: keyof IUserAccessFilters, value: string) => void;
  roles: string[];
  departments: string[];
}

export function UsersTabFilterBar({
  filters,
  onSearchChange,
  onFilterChange,
  roles,
  departments,
}: IProps) {
  return (
    <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[240px]">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск сотрудника..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
      <Select
        value={filters.role}
        onChange={(role) => onFilterChange("role", role)}
        className="w-48 h-[38px] rounded-xl text-sm"
        placeholder="Все роли"
        options={[
          { value: "all", label: "Все роли" },
          ...roles.map((r) => ({ value: r, label: r })),
        ]}
      />
      <Select
        value={filters.department}
        onChange={(department) => onFilterChange("department", department)}
        className="w-48 h-[38px] rounded-xl text-sm"
        placeholder="Все отделы"
        options={[
          { value: "all", label: "Все отделы" },
          ...departments.map((d) => ({ value: d, label: d })),
        ]}
      />
      <Select
        value={filters.status}
        onChange={(status) => onFilterChange("status", status)}
        className="w-40 h-[38px] rounded-xl text-sm"
        placeholder="Статус"
        options={[
          { value: "all", label: "Статус" },
          { value: "active", label: "Активен" },
          { value: "inactive", label: "Неактивен" },
          { value: "blocked", label: "Заблокирован" },
        ]}
      />
    </div>
  );
}
