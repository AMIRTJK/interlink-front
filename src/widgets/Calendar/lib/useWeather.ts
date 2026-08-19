import { useState, useEffect } from "react";
import type { WeatherType } from "../model";

export interface IWeatherData {
  temp: string;
  description: string;
  weatherType: WeatherType;
  isLoading: boolean;
}

const mapWeatherCode = (code: number): { description: string; weatherType: WeatherType } => {
  if (code === 0) {
    return { description: "Ясно", weatherType: "sun" };
  }
  if (code === 1 || code === 2) {
    return { description: "Переменная облачность", weatherType: "sun-cloud" };
  }
  if (code === 3 || code === 45 || code === 48) {
    return { description: "Пасмурно", weatherType: "cloud" };
  }
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) {
    return { description: "Дождь", weatherType: "rain" };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { description: "Снег", weatherType: "snow" };
  }
  if ([95, 96, 99].includes(code)) {
    return { description: "Гроза", weatherType: "rain" };
  }
  return { description: "Облачно", weatherType: "cloud" };
};

export const useWeather = (): IWeatherData => {
  const [weather, setWeather] = useState<IWeatherData>({
    temp: "+22°C",
    description: "Ясно",
    weatherType: "sun",
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        );
        if (!res.ok) throw new Error("Weather request failed");
        const json = await res.json();
        const current = json?.current;
        if (current && isMounted) {
          const rawTemp = Math.round(current.temperature_2m);
          const formattedTemp = rawTemp > 0 ? `+${rawTemp}°C` : `${rawTemp}°C`;
          const { description, weatherType } = mapWeatherCode(current.weather_code ?? 0);

          setWeather({
            temp: formattedTemp,
            description,
            weatherType,
            isLoading: false,
          });
        }
      } catch {
        if (isMounted) {
          setWeather({
            temp: "+22°C",
            description: "Переменная облачность",
            weatherType: "sun-cloud",
            isLoading: false,
          });
        }
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Default fallback coordinates (Dushanbe 38.56, 68.78)
          fetchWeather(38.56, 68.78);
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(38.56, 68.78);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return weather;
};
