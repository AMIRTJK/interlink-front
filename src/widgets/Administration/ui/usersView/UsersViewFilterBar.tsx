import * as React from "react";
import { X, Check } from "lucide-react";
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
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: T.shadow,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "0 12px",
            width: 240,
            height: 36,
          }}
        >
          <input
            type="text"
            className="admin__search-input"
            placeholder="Поиск сотрудника..."
            value={searchValue}
            onChange={(e) => onSearchValueChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onApplySearch(searchValue);
            }}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              color: T.textPrimary,
              fontFamily: T.font,
              width: "100%",
            }}
          />
          {searchValue && (
            <>
              <button
                onClick={onClearSearch}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  padding: 0,
                  color: T.textSecondary,
                }}
              >
                <X size={14} />
              </button>
              <button
                onClick={() => onApplySearch(searchValue)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  padding: 0,
                  color: T.accent,
                }}
              >
                <Check size={14} />
              </button>
            </>
          )}
        </div>
        <Select
          value={chipFilter || ""}
          onChange={(v) => onChipFilterChange(v || null)}
          style={{ width: 180, height: 36 }}
          options={[
            { value: "", label: "Все роли" },
            ...allRoleNames.map((role) => ({ value: role, label: role })),
          ]}
        />

        <Select
          value={departmentFilter || ""}
          onChange={(v) => onDepartmentFilterChange(v || null)}
          style={{ width: 200, height: 36 }}
          options={[
            { value: "", label: "Все отделы" },
            ...departments.map((d) => ({ value: d.name, label: d.name })),
          ]}
        />

        <Select
          value={statusFilter || ""}
          onChange={(v) => onStatusFilterChange(v || null)}
          style={{ width: 160, height: 36 }}
          options={[
            { value: "", label: "Статус" },
            { value: "active", label: "Активен" },
            { value: "inactive", label: "Неактивен" },
            { value: "blocked", label: "Заблокирован" },
            { value: "vacation", label: "В отпуске" },
            { value: "business_trip", label: "В командировке" },
          ]}
        />
      </div>

      {/* Role filter chips */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {chipFilters.map((chip) => {
          const isActive = chip.filter === chipFilter;
          const cfg = chip.filter ? getRoleColor(chip.filter) : null;
          return (
            <button
              key={chip.label}
              onClick={() => onChipFilterChange(chip.filter)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "0 12px",
                height: 28,
                borderRadius: 6,
                border: isActive
                  ? `1px solid ${cfg?.text ?? T.accent}`
                  : `1px solid ${T.border}`,
                background: isActive ? cfg?.bg ?? "#EFF6FF" : "transparent",
                color: isActive ? cfg?.text ?? T.accent : T.textSecondary,
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                fontFamily: T.font,
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              {cfg && isActive && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: cfg.text,
                    display: "inline-block",
                  }}
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
