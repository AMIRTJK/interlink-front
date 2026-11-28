import { useMemo } from "react";
import { Calendar } from "lucide-react";
import { Select, DatePicker, ConfigProvider, type ThemeConfig } from "antd";
import dayjs from "dayjs";
import { cn } from "@shared/lib";
import { Tooltip } from "@shared/ui";
import type { Colleague, Priority } from "../../model/types";
import { PRIORITY_OPTIONS } from "../../model/constants";
import type { TaskFilters } from "../../model/filters";
import { FIELD } from "./model";

// Цвета и тёмный режим приходят из глобального AntdThemeProvider; здесь только
// размеры, чтобы поля совпадали по высоте с остальной панелью.
const FIELD_THEME: ThemeConfig = { token: { controlHeight: 32, fontSize: 12 } };

const LABEL = "text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap";
const CONTROL =
  "font-semibold text-slate-700 dark:text-slate-100 [&_.ant-select-selection-placeholder]:text-slate-400! [&_input::placeholder]:text-slate-400!";

interface IProps {
  filters: TaskFilters;
  colleagues: Colleague[];
  onFilterChange: (patch: Partial<TaskFilters>) => void;
}

/** Фильтры, которых нет во вкладках: приоритет, исполнитель, дедлайн. */
export const TaskFilterSelects = ({ filters, colleagues, onFilterChange }: IProps) => {
  const colleagueOptions = useMemo(
    () => colleagues.map((c) => ({ value: String(c.id), label: c.name })),
    [colleagues],
  );
  const priorityLabel = PRIORITY_OPTIONS.find((o) => o.value === filters.priority)?.label;
  const assigneeLabel = colleagues.find((c) => String(c.id) === String(filters.assigneeId))?.name;

  return (
    <ConfigProvider theme={FIELD_THEME}>
      <Tooltip title={priorityLabel}>
        <div className={cn(FIELD, "pl-3.5 pr-1")}>
          <span className={LABEL}>Приоритет</span>
          <Select
            variant="borderless"
            value={filters.priority || undefined}
            placeholder="Все"
            onChange={(val) => onFilterChange({ priority: (val || "") as Priority })}
            allowClear
            options={PRIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            className={cn("w-[120px]", CONTROL)}
          />
        </div>
      </Tooltip>

      <Tooltip title={assigneeLabel}>
        <div className={cn(FIELD, "pl-3.5 pr-1")}>
          <span className={LABEL}>Исполнитель</span>
          <Select
            variant="borderless"
            value={filters.assigneeId ? String(filters.assigneeId) : undefined}
            placeholder="Все"
            onChange={(val) => onFilterChange({ assigneeId: val || "" })}
            allowClear
            showSearch
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            options={colleagueOptions}
            className={cn("w-[160px]", CONTROL)}
          />
        </div>
      </Tooltip>

      <div className={cn(FIELD, "pl-3.5 pr-1")}>
        <Calendar size={14} className="mr-1.5 shrink-0 text-slate-400" />
        <span className={LABEL}>Дедлайн</span>
        <DatePicker
          variant="borderless"
          value={filters.date ? dayjs(filters.date) : null}
          onChange={(d) => onFilterChange({ date: d ? d.format("YYYY-MM-DD") : "" })}
          format="DD.MM.YYYY"
          placeholder="Любой"
          allowClear
          className={cn("w-[120px]", CONTROL)}
        />
      </div>
    </ConfigProvider>
  );
};
