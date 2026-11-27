import { useEffect, useRef } from "react";
import { useIsDarkMode } from "@shared/lib";
import { startSnowfall } from "../lib/snowfall";

const SNOW_COLOR_DARK = "#ffffff";
// На светлом фоне белый снег не виден — берём холодный голубой.
const SNOW_COLOR_LIGHT = "#93c5fd";

export const Snowfall = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = useIsDarkMode();
  const colorRef = useRef(isDark ? SNOW_COLOR_DARK : SNOW_COLOR_LIGHT);

  colorRef.current = isDark ? SNOW_COLOR_DARK : SNOW_COLOR_LIGHT;

  useEffect(() => {
    if (!canvasRef.current) return;
    return startSnowfall(canvasRef.current, () => colorRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[45] h-screen w-screen"
    />
  );
};
