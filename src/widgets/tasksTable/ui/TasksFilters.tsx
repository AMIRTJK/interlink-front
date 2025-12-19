import { Select, DatePicker, Space, } from "antd";
import { useDynamicSearchParams } from "@shared/lib/hooks";
import { TASK_STATUS_OPTIONS } from "@features/tasks/model";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import { PRIORITY_OPTIONS } from "../model";
dayjs.locale("ru");
export const TasksFilters = () => {
  const { params, setParams } = useDynamicSearchParams();

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setParams("date", date ? date.format("YYYY-MM-DD") : "");
  };

  const handlePriorityChange = (value: string) => {
    setParams("priority", value);
  };

  const handleStatusChange = (value: string) => {
    setParams("status", value);
  };

  return (
    <div className="tasks-filters-container">
      <Space size="middle" wrap>
        <div className="filter-item">
          <DatePicker
            placeholder="Выберите дату"
            value={params.date ? dayjs(params.date) : null}
            onChange={handleDateChange}
          />
        </div>

        <div className="filter-item">
          <Select
            placeholder="Выберите приоритет"
            value={params.priority || undefined}
            onChange={handlePriorityChange}
            allowClear
            options={PRIORITY_OPTIONS}
          />
        </div>

        <div className="filter-item">
          <Select
            placeholder="Выберите статус"
            value={params.status || undefined}
            onChange={handleStatusChange}
            allowClear
            options={TASK_STATUS_OPTIONS}
          />
        </div>
      </Space>
    </div>
  );
};
