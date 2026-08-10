import { useCallback, useEffect, useState } from "react";
import {
  GLASS_CHANGE_EVENT,
  applyGlassClass,
  readGlassEnabled,
  writeGlassEnabled,
} from "@shared/config";

/**
 * Переключатель эффекта «стекла» для поверхностей с классом `ui-glass`.
 *
 * Само оформление включает класс на <html>, а не пропсы: кнопка в хедере не
 * знает о поверхностях, а поверхности — о кнопке. Собственное событие и
 * `storage` синхронизируют все копии хука (другая раскладка, соседняя вкладка).
 */
export const useGlassEffect = () => {
  const [isGlassEnabled, setIsGlassEnabled] = useState(readGlassEnabled);

  useEffect(() => {
    const sync = () => setIsGlassEnabled(readGlassEnabled());

    window.addEventListener(GLASS_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(GLASS_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleGlass = useCallback(() => {
    const next = !readGlassEnabled();

    writeGlassEnabled(next);
    applyGlassClass(next);
    setIsGlassEnabled(next);
    window.dispatchEvent(new Event(GLASS_CHANGE_EVENT));
  }, []);

  return { isGlassEnabled, toggleGlass };
};
