import { useState, useEffect, useCallback, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { WeatherType } from "../model";

export interface IDayWeatherInfo {
  temp: string;
  description: string;
  weatherType: WeatherType;
}

export interface IWeatherState {
  current: IDayWeatherInfo;
  dailyMap: Record<string, IDayWeatherInfo>;
  isLoading: boolean;
}

export const mapWeatherCode = (code: number): { description: string; weatherType: WeatherType } => {
  if (code === 0) {
    return { description: "Ясно", weatherType: "sun" };
  }
  if (code === 1 || code === 2) {
    return { description: "Переменная облачность", weatherType: "sun-cloud" };
  }
  if (code === 3 || code === 45 || code === 48) {
    return { description: "Пасмурно", weatherType: "cloud" };
  }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
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

// Deterministic seasonal weather fallback for dates outside forecast window
const getSeasonalFallback = (date: Dayjs): IDayWeatherInfo => {
  const d = date.date();
  const m = date.month(); // 0-11

  // Winter months (Dec, Jan, Feb)
  if (m === 11 || m === 0 || m === 1) {
    if (d % 4 === 0) return { temp: "-2°C", description: "Снег", weatherType: "snow" };
    if (d % 4 === 1) return { temp: "+1°C", description: "Переменная облачность", weatherType: "sun-cloud" };
    if (d % 4 === 2) return { temp: "-4°C", description: "Пасмурно", weatherType: "cloud" };
    return { temp: "-1°C", description: "Снегопад", weatherType: "snow" };
  }

  // Spring & Autumn
  if ([2, 3, 4, 8, 9, 10].includes(m)) {
    if (d % 5 === 0) return { temp: "+16°C", description: "Дождь", weatherType: "rain" };
    if (d % 5 === 1) return { temp: "+19°C", description: "Переменная облачность", weatherType: "sun-cloud" };
    if (d % 5 === 2) return { temp: "+15°C", description: "Пасмурно", weatherType: "cloud" };
    if (d % 5 === 3) return { temp: "+22°C", description: "Ясно", weatherType: "sun" };
    return { temp: "+17°C", description: "Кратковременный дождь", weatherType: "rain" };
  }

  // Summer (Jun, Jul, Aug)
  if (d % 6 === 0) return { temp: "+26°C", description: "Гроза", weatherType: "rain" };
  if (d % 6 === 1) return { temp: "+29°C", description: "Переменная облачность", weatherType: "sun-cloud" };
  if (d % 6 === 2) return { temp: "+27°C", description: "Облачно", weatherType: "cloud" };
  if (d % 6 === 3) return { temp: "+33°C", description: "Ясно", weatherType: "sun" };
  if (d % 6 === 4) return { temp: "+25°C", description: "Дождь", weatherType: "rain" };
  return { temp: "+31°C", description: "Солнечно", weatherType: "sun" };
};

// Module-level in-memory cache and promise deduplicator
let cachedWeather: IWeatherState | null = null;
let activeWeatherPromise: Promise<IWeatherState> | null = null;
const listeners = new Set<(state: IWeatherState) => void>();

const notifyListeners = (state: IWeatherState) => {
  listeners.forEach((listener) => listener(state));
};

const executeWeatherFetch = async (lat: number, lon: number): Promise<IWeatherState> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&past_days=7&forecast_days=16`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather request failed");
    const json = await res.json();

    const map: Record<string, IDayWeatherInfo> = {};

    if (json?.daily?.time && Array.isArray(json.daily.time)) {
      json.daily.time.forEach((dateStr: string, index: number) => {
        const code = json.daily.weather_code?.[index] ?? 0;
        const maxTemp = Math.round(json.daily.temperature_2m_max?.[index] ?? 20);
        const { description, weatherType } = mapWeatherCode(code);
        const formattedTemp = maxTemp > 0 ? `+${maxTemp}°C` : `${maxTemp}°C`;

        map[dateStr] = {
          temp: formattedTemp,
          description,
          weatherType,
        };
      });
    }

    let currentInfo: IDayWeatherInfo = {
      temp: "+24°C",
      description: "Ясно",
      weatherType: "sun",
    };

    if (json?.current) {
      const rawTemp = Math.round(json.current.temperature_2m);
      const formattedTemp = rawTemp > 0 ? `+${rawTemp}°C` : `${rawTemp}°C`;
      const { description, weatherType } = mapWeatherCode(json.current.weather_code ?? 0);
      currentInfo = {
        temp: formattedTemp,
        description,
        weatherType,
      };
    }

    const finalState: IWeatherState = {
      current: currentInfo,
      dailyMap: map,
      isLoading: false,
    };

    cachedWeather = finalState;
    notifyListeners(finalState);
    return finalState;
  } catch {
    const fallbackState: IWeatherState = {
      current: {
        temp: "+24°C",
        description: "Ясно",
        weatherType: "sun",
      },
      dailyMap: {},
      isLoading: false,
    };
    cachedWeather = fallbackState;
    notifyListeners(fallbackState);
    return fallbackState;
  } finally {
    activeWeatherPromise = null;
  }
};

const getOrFetchWeather = (): Promise<IWeatherState> => {
  if (cachedWeather && !cachedWeather.isLoading) {
    return Promise.resolve(cachedWeather);
  }
  if (activeWeatherPromise) {
    return activeWeatherPromise;
  }

  activeWeatherPromise = new Promise<IWeatherState>((resolve) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          executeWeatherFetch(pos.coords.latitude, pos.coords.longitude).then(resolve);
        },
        () => {
          executeWeatherFetch(38.56, 68.78).then(resolve); // Dushanbe default coordinates
        },
        { timeout: 4000 }
      );
    } else {
      executeWeatherFetch(38.56, 68.78).then(resolve);
    }
  });

  return activeWeatherPromise;
};

export const useWeather = () => {
  const [weatherState, setWeatherState] = useState<IWeatherState>(() => {
    return (
      cachedWeather || {
        current: {
          temp: "+24°C",
          description: "Ясно",
          weatherType: "sun",
        },
        dailyMap: {},
        isLoading: true,
      }
    );
  });

  useEffect(() => {
    listeners.add(setWeatherState);

    if (!cachedWeather) {
      getOrFetchWeather();
    } else if (weatherState !== cachedWeather) {
      setWeatherState(cachedWeather);
    }

    return () => {
      listeners.delete(setWeatherState);
    };
  }, []);

  const getWeatherForDate = useCallback(
    (date: Dayjs): IDayWeatherInfo => {
      const dateStr = date.format("YYYY-MM-DD");
      if (weatherState.dailyMap[dateStr]) {
        return weatherState.dailyMap[dateStr];
      }
      if (date.isSame(dayjs(), "day")) {
        return weatherState.current;
      }
      return getSeasonalFallback(date);
    },
    [weatherState]
  );

  return useMemo(
    () => ({
      current: weatherState.current,
      getWeatherForDate,
      isLoading: weatherState.isLoading,
    }),
    [weatherState, getWeatherForDate]
  );
};
