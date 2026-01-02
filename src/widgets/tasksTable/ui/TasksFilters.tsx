import { Select, DatePicker, ConfigProvider } from "antd";
import { useDynamicSearchParams } from "@shared/lib/hooks";
import { TASK_STATUS_OPTIONS } from "@features/tasks/model";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { PRIORITY_OPTIONS } from "../model";
import { useState } from "react";
import { FilterOutlined } from "@ant-design/icons";

dayjs.locale("ru");

export const TasksFilters = () => {
  const { params, setParams } = useDynamicSearchParams();
  const [collapsed, setCollapsed] = useState(true);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setParams("date", date ? date.format("YYYY-MM-DD") : "");
  };

  const handlePriorityChange = (value: string) => {
    setParams("priority", value);
  };

  const handleStatusChange = (value: string) => {
    setParams("status", value);
  };

  const themeToken = {
    borderRadius: 8,
    controlHeight: 40,
    componentDisabledBg: "white",
  };

  return (
    <div className="bg-[#0037AF] rounded-xl p-3 transition-all">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 text-white">
          <FilterOutlined />
          <span className="text-sm font-medium">Фильтр</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors cursor-pointer bg-transparent border-none"
        >
          {collapsed ? "Показать" : "Скрыть"}
        </button>
      </div>

      {!collapsed && (
        <ConfigProvider
          theme={{
            token: themeToken,
            components: {
              Select: { selectorBg: "white" },
              Input: { activeBorderColor: "#ffffff" },
              DatePicker: { controlHeight: 40 },
            },
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="filter-item">
              <DatePicker
                className="w-full"
                placeholder="Выберите дату"
                value={params.date ? dayjs(params.date) : null}
                onChange={handleDateChange}
              />
            </div>

            <div className="filter-item">
              <Select
                className="w-full"
                placeholder="Выберите приоритет"
                value={params.priority || undefined}
                onChange={handlePriorityChange}
                allowClear
                options={PRIORITY_OPTIONS}
              />
            </div>

            <div className="filter-item">
              <Select
                className="w-full"
                placeholder="Выберите статус"
                value={params.status || undefined}
                onChange={handleStatusChange}
                allowClear
                options={TASK_STATUS_OPTIONS}
              />
            </div>
          </div>
        </ConfigProvider>
      )}
    </div>
  );
};
