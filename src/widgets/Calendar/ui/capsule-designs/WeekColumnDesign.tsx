import { memo } from "react";
import { formatDegrees } from "../../lib";
import type { IDayWeatherInfo } from "../../lib/useWeather";
import { WeatherReadout } from "./WeatherReadout";
import "./sky.css";

interface IProps {
  weather: IDayWeatherInfo | null;
}

export const getWeekColumnDesignClass = (weather: IDayWeatherInfo | null) =>
  `sky-card sky-card--column sky-card--${weather?.weatherType ?? "none"}`;

/** Сводка погоды в шапке колонки недели — как карточка погодного виджета. */
export const WeekColumnDesign = memo(({ weather }: IProps) => {
  if (!weather) return null;

  return (
    <div className="absolute! top-3! left-3! right-3! z-[2]! pointer-events-none! min-w-0!">
      <WeatherReadout weather={weather} />
      <div className="mt-1! text-xs! font-medium! opacity-90! truncate!">
        {weather.isEstimate ? `Как год назад: ${weather.description.toLowerCase()}` : weather.description}
      </div>
      {weather.max !== undefined && weather.min !== undefined && (
        <div className="mt-0.5! text-xs! opacity-80! tabular-nums! truncate!">
          Макс. {formatDegrees(weather.max)} · Мин. {formatDegrees(weather.min)}
        </div>
      )}
    </div>
  );
});
