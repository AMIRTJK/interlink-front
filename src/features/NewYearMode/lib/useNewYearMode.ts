import { useCallback, useEffect, useState } from "react";
import { NEW_YEAR_CHANGE_EVENT, NEW_YEAR_STORAGE_KEY, type TNewYearEffect } from "../model";
import { readNewYearSettings, writeNewYearSettings } from "./newYearStorage";

/**
 * Настройки новогоднего режима: общий выключатель и набор эффектов.
 *
 * Копии хука живут в шапке, боковом меню и раскладке одновременно, поэтому
 * синхронизируются собственным событием и `storage` (соседняя вкладка).
 */
export const useNewYearMode = () => {
  const [settings, setSettings] = useState(readNewYearSettings);

  useEffect(() => {
    const sync = () => setSettings(readNewYearSettings());
    const syncStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === NEW_YEAR_STORAGE_KEY) sync();
    };

    window.addEventListener(NEW_YEAR_CHANGE_EVENT, sync);
    window.addEventListener("storage", syncStorage);
    return () => {
      window.removeEventListener(NEW_YEAR_CHANGE_EVENT, sync);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  const toggleEnabled = useCallback(() => {
    const current = readNewYearSettings();
    writeNewYearSettings({ ...current, isEnabled: !current.isEnabled });
  }, []);

  const toggleEffect = useCallback((effect: TNewYearEffect) => {
    const current = readNewYearSettings();
    writeNewYearSettings({
      ...current,
      effects: { ...current.effects, [effect]: !current.effects[effect] },
    });
  }, []);

  const isEffectActive = (effect: TNewYearEffect) =>
    settings.isEnabled && settings.effects[effect];

  return {
    isEnabled: settings.isEnabled,
    effects: settings.effects,
    isEffectActive,
    toggleEnabled,
    toggleEffect,
  };
};
