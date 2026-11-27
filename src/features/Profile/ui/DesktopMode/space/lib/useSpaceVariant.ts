import { useCallback, useState } from "react";
import {
  DEFAULT_SPACE_VARIANT,
  STORAGE_SPACE_VARIANT_KEY,
  isSpaceVariant,
  type TSpaceVariant,
} from "../model";

// Хранилище может быть недоступно (приватный режим, запрет cookies) — тогда просто дефолт.
const readStoredVariant = (): TSpaceVariant => {
  try {
    const stored = localStorage.getItem(STORAGE_SPACE_VARIANT_KEY);
    return isSpaceVariant(stored) ? stored : DEFAULT_SPACE_VARIANT;
  } catch {
    return DEFAULT_SPACE_VARIANT;
  }
};

export const useSpaceVariant = () => {
  const [variant, setVariant] = useState<TSpaceVariant>(readStoredVariant);

  const selectVariant = useCallback((next: TSpaceVariant) => {
    setVariant(next);
    try {
      localStorage.setItem(STORAGE_SPACE_VARIANT_KEY, next);
    } catch {
      // Выбор просто не переживёт перезагрузку — экран от этого не ломается.
    }
  }, []);

  return { variant, selectVariant };
};
