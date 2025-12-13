import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { ViewMode } from "../model";

interface CalendarHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  dateRange: string;
}

export const CalendarHeader = ({
  viewMode,
  setViewMode,
  onPrev,
  onNext,
  dateRange,
}: CalendarHeaderProps) => {
  return (
    <div className="weekly-calendar__header">
      <div className="weekly-calendar__nav">
        <Button type="text" icon={<LeftOutlined />} onClick={onPrev} />
        <span className="weekly-calendar__date-range">{dateRange}</span>
        <Button type="text" icon={<RightOutlined />} onClick={onNext} />
      </div>
      <div className="weekly-calendar__view-switcher">
        <Button
          type={viewMode === "week" ? "primary" : "text"}
          onClick={() => setViewMode("week")}
        >
          Неделя
        </Button>
        <Button
          type={viewMode === "month" ? "primary" : "text"}
          onClick={() => setViewMode("month")}
        >
          Месяц
        </Button>
        <Button
          type={viewMode === "day" ? "primary" : "text"}
          onClick={() => setViewMode("day")}
        >
          День
        </Button>
      </div>
    </div>
  );
};
