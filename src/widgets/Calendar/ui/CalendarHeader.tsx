import { Button as ButtonAntd } from "antd";
import type { ViewMode } from "../model";
import { Button } from "@shared/ui";

import LeftArrow from "../../../assets/icons/left-arrow.svg";
import RightArrow from "../../../assets/icons/right-arrow.svg";

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
      <Button
        text="Сейчас"
        type="default"
        className="bg-transparent! border-2! border-[#F5F6F7]! px-5! text-[#6B7A99]! text-[12px]! font-medium! h-full rounded-[15px]! shadow-[0_4px_10px_#26334D0D]!"
      />
      <div className="weekly-calendar__nav">
        <ButtonAntd
          onClick={onPrev}
          className="border-2! border-[#F5F6F7]! "
          type="default"
          shape="circle"
          style={{ width: 40, height: 40, padding: 0 }}
          icon={<img className="h-7 w-7" src={LeftArrow}></img>}
        />
        <p className="weekly-calendar__date-range">{dateRange}</p>
        <ButtonAntd
          onClick={onNext}
          className="border-2! border-[#F5F6F7]! "
          type="default"
          shape="circle"
          style={{ width: 40, height: 40, padding: 0 }}
          icon={<img className="h-7 w-7" src={RightArrow}></img>}
        />
      </div>
      <div className="weekly-calendar__view-switcher">
        <ButtonAntd
          className={`h-full! ${viewMode === "week" ? "text-[#6B7A99]!" : "text-[#ADB8CC]!"}`}
          type="text"
          onClick={() => setViewMode("week")}
        >
          Неделя
        </ButtonAntd>
        <ButtonAntd
          className={`h-full! ${viewMode === "month" ? "text-[#6B7A99]!" : "text-[#ADB8CC]!"}`}
          type="text"
          onClick={() => setViewMode("month")}
        >
          Месяц
        </ButtonAntd>
        <ButtonAntd
          className={`h-full! ${viewMode === "day" ? "text-[#6B7A99]!" : "text-[#ADB8CC]!"}`}
          type="text"
          onClick={() => setViewMode("day")}
        >
          День
        </ButtonAntd>
      </div>
    </div>
  );
};
