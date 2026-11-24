import { useCallback, useState } from "react";
import {
  DEFAULT_WATCH_VARIANT,
  STORAGE_WATCH_VARIANT_KEY,
  isWatchVariant,
  type TWatchVariant,
} from "../model";

// Хранилище может быть недоступно (приватный режим, запрет cookies) — тогда просто дефолт.
const readStoredVariant = (): TWatchVariant => {
  try {
    const stored = localStorage.getItem(STORAGE_WATCH_VARIANT_KEY);
    return isWatchVariant(stored) ? stored : DEFAULT_WATCH_VARIANT;
  } catch {
    return DEFAULT_WATCH_VARIANT;
  }
};

export const useWatchVariant = () => {
  const [variant, setVariant] = useState<TWatchVariant>(readStoredVariant);

  const selectVariant = useCallback((next: TWatchVariant) => {
    setVariant(next);
    try {
      localStorage.setItem(STORAGE_WATCH_VARIANT_KEY, next);
    } catch {
      // Выбор просто не переживёт перезагрузку — экран от этого не ломается.
    }
  }, []);

  return { variant, selectVariant };
};
