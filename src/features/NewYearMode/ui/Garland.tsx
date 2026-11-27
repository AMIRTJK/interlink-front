import { GARLAND_BULB_COUNT, GARLAND_COLORS } from "../model";

interface IBulb {
  id: number;
  color: string;
  delay: string;
  offset: string;
}

// Лампочки статичны, поэтому собираем их один раз на уровне модуля.
const BULBS: IBulb[] = Array.from({ length: GARLAND_BULB_COUNT }, (_, id) => ({
  id,
  color: GARLAND_COLORS[id % GARLAND_COLORS.length],
  delay: `${(id % GARLAND_COLORS.length) * 0.35}s`,
  offset: id % 2 === 0 ? "translateY(0)" : "translateY(4px)",
}));

export const Garland = () => (
  <div
    aria-hidden="true"
    className="new-year-garland pointer-events-none fixed inset-x-0 top-0 z-[55] h-5 overflow-hidden"
  >
    <div className="absolute inset-x-0 top-1 h-px bg-zinc-500/40 dark:bg-zinc-300/30" />
    <div className="flex gap-9 px-4">
      {BULBS.map((bulb) => (
        <span
          key={bulb.id}
          className="new-year-garland__bulb"
          style={{ transform: bulb.offset }}
        >
          <span className="new-year-garland__cap" />
          <span
            className="new-year-garland__glass"
            style={{
              backgroundColor: bulb.color,
              boxShadow: `0 0 8px 2px ${bulb.color}`,
              animationDelay: bulb.delay,
            }}
          />
        </span>
      ))}
    </div>
  </div>
);
