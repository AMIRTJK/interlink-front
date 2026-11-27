import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import {
  WEATHER_FORECAST_DAYS,
  WEATHER_PAST_DAYS,
  loadLocationStorage,
  mapWeatherCode,
  useWeather,
  type IDayWeatherInfo,
} from "./useWeather";

const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const DATE_FORMAT = "YYYY-MM-DD";
const ARCHIVE_CACHE_MS = 24 * 60 * 60 * 1000;
// Для дат дальше прогноза берём те же даты годом раньше — ориентир, а не прогноз.
const ESTIMATE_YEARS_BACK = 1;

type TDailyMap = Record<string, IDayWeatherInfo>;

interface IArchiveResponse {
  daily?: {
    time?: string[];
    weather_code?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
  };
}

interface IRange {
  start: string;
  end: string;
}

const formatTemp = (value: number) => {
  const rounded = Math.round(value);
  return rounded > 0 ? `+${rounded}°C` : `${rounded}°C`;
};

const fetchArchive = async (lat: number, lon: number, range: IRange): Promise<TDailyMap> => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    start_date: range.start,
    end_date: range.end,
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
  });
  const res = await fetch(`${ARCHIVE_URL}?${params.toString()}`);
  if (!res.ok) throw new Error("Weather archive request failed");
  const json: IArchiveResponse = await res.json();

  const map: TDailyMap = {};
  json.daily?.time?.forEach((dateStr, index) => {
    const max = json.daily?.temperature_2m_max?.[index];
    const code = json.daily?.weather_code?.[index];
    if (max === null || max === undefined || code === null || code === undefined) return;
    const min = json.daily?.temperature_2m_min?.[index] ?? max;
    map[dateStr] = { ...mapWeatherCode(code), temp: formatTemp(max), max, min };
  });
  return map;
};

const toRange = (days: Dayjs[], shiftYears = 0): IRange | null => {
  if (!days.length) return null;
  return {
    start: days[0].subtract(shiftYears, "year").format(DATE_FORMAT),
    end: days[days.length - 1].subtract(shiftYears, "year").format(DATE_FORMAT),
  };
};

/**
 * Погода на любой видимый день календаря. Окно прогноза open-meteo (45 дней назад —
 * 16 вперёд) берётся из useWeather; раньше — фактическая погода из архива; позже —
 * те же даты прошлого года с пометкой isEstimate: настоящего прогноза так далеко нет.
 */
export const useCalendarWeather = (days: Dayjs[]) => {
  const { getAnyWeatherForDate } = useWeather();
  const location = loadLocationStorage();

  const { pastRange, futureRange } = useMemo(() => {
    const today = dayjs().startOf("day");
    const forecastStart = today.subtract(WEATHER_PAST_DAYS, "day");
    const forecastEnd = today.add(WEATHER_FORECAST_DAYS - 1, "day");
    return {
      pastRange: toRange(days.filter((day) => day.isBefore(forecastStart, "day"))),
      futureRange: toRange(
        days.filter((day) => day.isAfter(forecastEnd, "day")),
        ESTIMATE_YEARS_BACK,
      ),
    };
  }, [days]);

  const archiveOptions = { staleTime: Infinity, cacheTime: ARCHIVE_CACHE_MS, retry: 1 };

  const { data: pastMap } = useQuery({
    queryKey: ["calendar-weather-archive", location.lat, location.lon, pastRange],
    queryFn: () => fetchArchive(location.lat, location.lon, pastRange as IRange),
    enabled: pastRange !== null,
    ...archiveOptions,
  });

  const { data: estimateMap } = useQuery({
    queryKey: ["calendar-weather-archive", location.lat, location.lon, futureRange],
    queryFn: () => fetchArchive(location.lat, location.lon, futureRange as IRange),
    enabled: futureRange !== null,
    ...archiveOptions,
  });

  return useCallback(
    (date: Dayjs): IDayWeatherInfo | null => {
      const fromForecast = getAnyWeatherForDate(date);
      if (fromForecast) return fromForecast;

      const fact = pastMap?.[date.format(DATE_FORMAT)];
      if (fact) return fact;

      const estimate = estimateMap?.[date.subtract(ESTIMATE_YEARS_BACK, "year").format(DATE_FORMAT)];
      return estimate ? { ...estimate, isEstimate: true } : null;
    },
    [getAnyWeatherForDate, pastMap, estimateMap],
  );
};
