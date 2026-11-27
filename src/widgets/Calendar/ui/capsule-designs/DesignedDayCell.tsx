import { memo, useState } from "react";
import type { Dayjs } from "dayjs";
import type { Task } from "@features/tasks";
import { getEventStyle } from "../../model";
import { getWeekdayLabel, isWeekendDay, splitTemperature } from "../../lib";
import type { IDayWeatherInfo } from "../../lib/useWeather";
import { getWeatherValue } from "./WeatherReadout";
import { SkyVideo } from "./SkyVideo";
import "./sky.css";

interface IProps {
  day: Dayjs;
  tasks: Task[];
  weather: IDayWeatherInfo | null;
  isToday: boolean;
  onDayClick: (date: Dayjs) => void;
  onEventClick: (task: Task) => void;
}

// Без рамки: фон-картинка рисуется и под ней, и полупрозрачная линия читалась
// как светлый край сверху. Наведение — тонкое внутреннее кольцо.
const CARD_BASE =
  "flex! flex-col! p-2.5! rounded-[1.6rem]! cursor-pointer! transition-shadow! duration-200!";
const CARD_TODAY = "ring-2! ring-[rgb(var(--th-accent-rgb))]!";
const CARD_HOVER = "hover:ring-1! hover:ring-inset! hover:ring-white/70!";

// Число дня — главный текст капсулы, как крупная цифра погодного виджета.
const DAY_NUMBER = "font-semibold! tracking-tight!";

// Выходные выделены тёплым, как прежняя шапка СБ/ВС; оттенок зависит от фона (sky.css).
const WEEKDAY_CLASS = "text-xs! font-semibold! uppercase! tracking-wide!";
const getWeekdayTone = (isWeekend: boolean) => (isWeekend ? "text-[var(--cap-weekend,#fcd34d)]!" : "opacity-80!");

const formatCompactTemperature = (weather: IDayWeatherInfo) => {
  const { whole, fraction } = splitTemperature(getWeatherValue(weather));
  return `${weather.isEstimate ? "≈" : ""}${whole}${fraction}°`;
};

export const DesignedDayCell = memo(
  ({ day, tasks, weather, isToday, onDayClick, onEventClick }: IProps) => {
    const hasEvents = tasks.length > 0;
    const weekdayTone = getWeekdayTone(isWeekendDay(day));
    const skyKind = weather?.weatherType ?? "none";
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        onClick={() => onDayClick(day)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`sky-card sky-card--${skyKind} ${CARD_BASE} ${isToday ? CARD_TODAY : CARD_HOVER}`}
      >
        <SkyVideo kind={skyKind} isActive={isToday || isHovered} />
        <div className="relative! z-[2]! flex! flex-col! h-full! min-h-0!">
          {hasEvents ? (
            <>
              <div className="flex! items-center! justify-between! gap-1.5!">
                <span className="flex! items-baseline! gap-1.5!">
                  <span className={`text-[22px]! leading-none! pl-0.5! ${DAY_NUMBER}`}>{day.date()}</span>
                  <span className={`${WEEKDAY_CLASS} ${weekdayTone}`}>{getWeekdayLabel(day)}</span>
                </span>
                {weather && (
                  <span className="text-xs! font-semibold! tabular-nums! shrink-0!">
                    {formatCompactTemperature(weather)}
                  </span>
                )}
              </div>
              <div className="mt-1.5! flex-1! flex! flex-col! gap-1.5! overflow-y-auto! no-scrollbar!">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(task);
                    }}
                    title={`${task.time ? task.time + " " : ""}${task.title}`}
                    className="w-full! py-1! px-2! rounded-full! bg-white/25! backdrop-blur-sm! border! border-white/40! text-xs! font-semibold! leading-tight! flex! items-center! gap-1.5! truncate!"
                  >
                    <span className={`w-1.5! h-1.5! rounded-full! ${getEventStyle(task.color).dot} flex-shrink-0!`} />
                    <span className="truncate!">
                      {task.time ? `${task.time} ` : ""}
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {weather && (
                <div className="text-xs! font-medium! opacity-90! truncate! pl-0.5! max-w-[70%]!">
                  <span className="font-semibold! tabular-nums!">{formatCompactTemperature(weather)}</span>
                  {" · "}
                  {weather.description}
                </div>
              )}
              <div className="mt-auto! flex! items-end! gap-2! min-w-0!">
                <span className={`text-[32px]! leading-none! ${DAY_NUMBER}`}>{day.date()}</span>
                <span className={`mb-1! ${WEEKDAY_CLASS} ${weekdayTone}`}>{getWeekdayLabel(day)}</span>
                {isToday && (
                  <span className="mb-0.5! px-2! py-0.5! rounded-full! bg-white! text-xs! font-semibold! text-[rgb(var(--th-accent-rgb))]! [text-shadow:none]!">
                    Сегодня
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  },
);
