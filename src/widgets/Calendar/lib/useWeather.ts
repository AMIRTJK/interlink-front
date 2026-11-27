import { useState, useEffect, useCallback, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { WeatherType } from "../model";

export interface IDayWeatherInfo {
	temp: string;
	description: string;
	weatherType: WeatherType;
	// Сырые значения дня (только из дневного прогноза): дробная часть и H/L в капсулах.
	max?: number;
	min?: number;
	// Дата дальше окна прогноза: погода тех же дат прошлого года, а не прогноз.
	isEstimate?: boolean;
}

export interface IWeatherState {
	current: IDayWeatherInfo | null;
	dailyMap: Record<string, IDayWeatherInfo>;
	isLoading: boolean;
}

export const mapWeatherCode = (
	code: number,
): { description: string; weatherType: WeatherType } => {
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

const DUSHANBE_LAT = 38.56;
const DUSHANBE_LON = 68.78;
const WEATHER_CACHE_KEY = "calendar_weather_cache_v6";
// Сетка месяца начинается до 41 дня раньше сегодняшнего: фактическую погоду берём с запасом.
export const WEATHER_PAST_DAYS = 45;
// Максимум open-meteo: хватает на хвост сетки месяца после текущего дня.
export const WEATHER_FORECAST_DAYS = 16;
const LOCATION_STORAGE_KEY = "calendar_user_location_v1";
const WEATHER_CACHE_TTL_MS = 60 * 60 * 1000; // 1 час

export const loadLocationStorage = (): { lat: number; lon: number } => {
	try {
		const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	return { lat: DUSHANBE_LAT, lon: DUSHANBE_LON };
};

const saveLocationStorage = (lat: number, lon: number) => {
	try {
		localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ lat, lon }));
	} catch {}
};

const loadWeatherStorage = (): IWeatherState | null => {
	try {
		const raw = localStorage.getItem(WEATHER_CACHE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (Date.now() - parsed.savedAt < WEATHER_CACHE_TTL_MS && parsed.state) {
			return parsed.state;
		}
	} catch {}
	return null;
};

const saveWeatherStorage = (state: IWeatherState) => {
	try {
		localStorage.setItem(
			WEATHER_CACHE_KEY,
			JSON.stringify({ savedAt: Date.now(), state }),
		);
	} catch {}
};

let cachedWeather: IWeatherState | null = loadWeatherStorage();
let activeWeatherPromise: Promise<IWeatherState> | null = null;
let hasRequestedGeo = false;
const listeners = new Set<(state: IWeatherState) => void>();

const notifyListeners = (state: IWeatherState) => {
	listeners.forEach((listener) => listener(state));
};

const executeWeatherFetch = async (
	lat: number,
	lon: number,
): Promise<IWeatherState> => {
	try {
		const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&past_days=${WEATHER_PAST_DAYS}&forecast_days=${WEATHER_FORECAST_DAYS}`;
		const res = await fetch(url);
		if (!res.ok) throw new Error("Weather request failed");
		const json = await res.json();

		const map: Record<string, IDayWeatherInfo> = {};

		if (json?.daily?.time && Array.isArray(json.daily.time)) {
			json.daily.time.forEach((dateStr: string, index: number) => {
				const code = json.daily.weather_code?.[index] ?? 0;
				const rawMax = json.daily.temperature_2m_max?.[index] ?? 20;
				const rawMin = json.daily.temperature_2m_min?.[index] ?? rawMax;
				const maxTemp = Math.round(rawMax);
				const { description, weatherType } = mapWeatherCode(code);
				const formattedTemp = maxTemp > 0 ? `+${maxTemp}°C` : `${maxTemp}°C`;

				map[dateStr] = {
					temp: formattedTemp,
					description,
					weatherType,
					max: rawMax,
					min: rawMin,
				};
			});
		}

		let currentInfo: IDayWeatherInfo | null = null;

		if (json?.current) {
			const rawTemp = Math.round(json.current.temperature_2m);
			const formattedTemp = rawTemp > 0 ? `+${rawTemp}°C` : `${rawTemp}°C`;
			const { description, weatherType } = mapWeatherCode(
				json.current.weather_code ?? 0,
			);
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
		saveWeatherStorage(finalState);
		notifyListeners(finalState);
		return finalState;
	} catch {
		const fallbackState: IWeatherState = {
			current: null,
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

const detectLocationInBackground = () => {
	if (hasRequestedGeo || typeof navigator === "undefined" || !("geolocation" in navigator)) {
		return;
	}
	hasRequestedGeo = true;

	navigator.geolocation.getCurrentPosition(
		(pos) => {
			const { latitude, longitude } = pos.coords;
			const saved = loadLocationStorage();
			if (
				Math.abs(latitude - saved.lat) > 0.2 ||
				Math.abs(longitude - saved.lon) > 0.2
			) {
				saveLocationStorage(latitude, longitude);
				executeWeatherFetch(latitude, longitude);
			}
		},
		() => {},
		{ timeout: 6000, maximumAge: 600000 },
	);
};

const getOrFetchWeather = (): Promise<IWeatherState> => {
	detectLocationInBackground();

	if (cachedWeather && !cachedWeather.isLoading) {
		return Promise.resolve(cachedWeather);
	}
	if (activeWeatherPromise) {
		return activeWeatherPromise;
	}

	const loc = loadLocationStorage();
	activeWeatherPromise = executeWeatherFetch(loc.lat, loc.lon);
	return activeWeatherPromise;
};

export const useWeather = () => {
	const [weatherState, setWeatherState] = useState<IWeatherState>(() => {
		return (
			cachedWeather || {
				current: null,
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

	const { current: currentWeather, dailyMap, isLoading } = weatherState;

	const getAnyWeatherForDate = useCallback(
		(date: Dayjs): IDayWeatherInfo | null => {
			const dateStr = date.format("YYYY-MM-DD");
			if (dailyMap[dateStr]) {
				return dailyMap[dateStr];
			}
			if (date.isSame(dayjs(), "day") && currentWeather) {
				return currentWeather;
			}
			return null;
		},
		[dailyMap, currentWeather],
	);

	// Показываем погоду только начиная с СЕГОДНЯ и до конца текущей недели (воскресенье)
	const getWeatherForDate = useCallback(
		(date: Dayjs): IDayWeatherInfo | null => {
			const today = dayjs().startOf("day");
			const target = date.startOf("day");
			if (target.isBefore(today) || target.isAfter(today.endOf("isoWeek"))) {
				return null;
			}
			return getAnyWeatherForDate(date);
		},
		[getAnyWeatherForDate],
	);

	return useMemo(
		() => ({
			current: currentWeather,
			getWeatherForDate,
			getAnyWeatherForDate,
			isLoading,
		}),
		[currentWeather, getWeatherForDate, getAnyWeatherForDate, isLoading],
	);
};

