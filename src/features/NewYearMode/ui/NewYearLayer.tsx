import { lazy, Suspense } from "react";
import { useNewYearMode } from "../lib/useNewYearMode";
import { useReducedMotion } from "../lib/useReducedMotion";

const NewYearEffects = lazy(() => import("./NewYearEffects"));

interface IProps {
  /** Нижнее меню занимает низ экрана — отсчёт поднимается над ним. */
  isBottomNav?: boolean;
}

/**
 * Слой новогодних эффектов поверх раскладки. Пока режим выключен, ничего не
 * монтируется и код эффектов не загружается.
 */
export const NewYearLayer = ({ isBottomNav = false }: IProps) => {
  const { isEnabled, effects } = useNewYearMode();
  const isReducedMotion = useReducedMotion();

  if (!isEnabled) return null;

  return (
    <Suspense fallback={null}>
      <NewYearEffects
        effects={effects}
        isBottomNav={isBottomNav}
        isReducedMotion={isReducedMotion}
      />
    </Suspense>
  );
};
