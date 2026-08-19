import { memo } from "react";
import { Sun, Cloud, Snowflake, CloudSun, CloudRain } from "lucide-react";
import type { WeatherType } from "../model";

interface IWeatherIconProps {
  type: WeatherType;
  className?: string;
  size?: number;
}

export const WeatherIcon = memo(({ type, className = "", size = 14 }: IWeatherIconProps) => {
  switch (type) {
    case "sun":
      return <Sun size={size} className={`text-amber-500 ${className}`} />;
    case "sun-cloud":
      return <CloudSun size={size} className={`text-sky-500 ${className}`} />;
    case "cloud":
      return <Cloud size={size} className={`text-slate-400 ${className}`} />;
    case "snow":
      return <Snowflake size={size} className={`text-indigo-400 ${className}`} />;
    case "rain":
      return <CloudRain size={size} className={`text-teal-500 ${className}`} />;
    default:
      return <Sun size={size} className={`text-amber-500 ${className}`} />;
  }
});
