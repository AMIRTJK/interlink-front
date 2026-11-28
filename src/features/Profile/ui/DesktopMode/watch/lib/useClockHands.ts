import { useEffect, useRef } from "react";

const DEG_PER_SECOND = 6;
const TICK_TRANSITION = "transform 220ms cubic-bezier(0.35, 1.9, 0.55, 1)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Стрелки крутятся прямой записью transform в DOM, без React-состояния:
 * раз в секунду перерисовываются только три элемента, а не дерево экрана.
 */
export const useClockHands = () => {
  const hourRef = useRef<SVGGElement>(null);
  const minuteRef = useRef<SVGGElement>(null);
  const secondRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    let timeoutId: ReturnType<typeof setTimeout>;
    // Угол секундной стрелки только растёт: иначе на 59→0 переход крутил бы её назад.
    let secondAngle = -1;

    const apply = (isFirst: boolean) => {
      const now = new Date();
      const s = now.getSeconds();
      const m = now.getMinutes() + s / 60;
      const h24 = now.getHours() + m / 60;

      const target = s * DEG_PER_SECOND;
      let next = secondAngle < 0 ? target : secondAngle - (secondAngle % 360) + target;
      if (secondAngle >= 0 && next < secondAngle) next += 360;
      const isSingleTick = !isFirst && next - secondAngle === DEG_PER_SECOND;
      secondAngle = next;

      if (hourRef.current) hourRef.current.style.transform = `rotate(${(h24 % 12) * 30}deg)`;
      if (minuteRef.current) minuteRef.current.style.transform = `rotate(${m * 6}deg)`;
      const sec = secondRef.current;
      if (sec) {
        sec.style.transition = isSingleTick && !reducedMotion.matches ? TICK_TRANSITION : "none";
        sec.style.transform = `rotate(${next}deg)`;
      }
    };

    const schedule = () => {
      timeoutId = setTimeout(() => {
        apply(false);
        schedule();
      }, 1000 - (Date.now() % 1000));
    };

    apply(true);
    schedule();
    return () => clearTimeout(timeoutId);
  }, []);

  return { hourRef, minuteRef, secondRef };
};
