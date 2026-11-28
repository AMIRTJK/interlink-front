import { memo, useId } from "react";
import plateSrc from "../assets/clock-plate.webp";
import { CLOCK_PLATE_H, CLOCK_PLATE_W } from "../watch/model";
import { useClockHands } from "../watch/lib/useClockHands";
import { WatchHands } from "../watch/ui/WatchHands";

/**
 * Фон сцены «Часы»: 4K-картинка и живые тикающие стрелки лежат в одном SVG 3840×2144,
 * поэтому ось стрелок привязана к центру циферблата с точностью до пикселя при любом размере окна.
 */
const ClockBgComponent = () => {
  const uid = `clock-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const refs = useClockHands();

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <svg
        viewBox={`0 0 ${CLOCK_PLATE_W} ${CLOCK_PLATE_H}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className="absolute inset-0 block w-full h-full"
      >
        <image
          href={plateSrc}
          x="0"
          y="0"
          width={CLOCK_PLATE_W}
          height={CLOCK_PLATE_H}
          preserveAspectRatio="none"
        />
        <WatchHands uid={uid} refs={refs} />
      </svg>
    </div>
  );
};

// Экран ререндерится каждую секунду ради цифрового времени — фон с часами при этом не трогаем.
export const ClockBg = memo(ClockBgComponent);
