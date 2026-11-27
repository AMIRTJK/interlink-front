import type { IDayWeatherInfo } from "../../lib/useWeather";
import { splitTemperature } from "../../lib";

interface IProps {
  weather: IDayWeatherInfo;
}

export const getWeatherValue = (weather: IDayWeatherInfo): number =>
  weather.max ?? parseFloat(weather.temp);

/** Крупная температура погодного виджета: «28°» и мелкая дробная часть «.6». */
export const WeatherReadout = ({ weather }: IProps) => {
  const { whole, fraction } = splitTemperature(getWeatherValue(weather));

  return (
    <div className="flex! items-start! leading-none!">
      <span className="text-[30px]! font-semibold! tracking-tight!">
        {weather.isEstimate ? "≈" : ""}
        {whole}°
      </span>
      {fraction && <span className="text-sm! font-semibold! self-end! mb-0.5!">{fraction}</span>}
    </div>
  );
};
