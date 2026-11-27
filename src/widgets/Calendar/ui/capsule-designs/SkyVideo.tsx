import { useEffect, useState } from "react";
import type { WeatherType } from "../../model";

type TSkyKind = WeatherType | "none";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Зацикленные ролики фонов капсул (первый кадр = последнему = статичной картинке из sky.css).
// Погоды без ролика остаются статичными.
const SKY_VIDEOS: Partial<Record<TSkyKind, string>> = {};

const usePrefersReducedMotion = () => {
  const [isReduced, setIsReduced] = useState(() => window.matchMedia(REDUCED_MOTION_QUERY).matches);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = () => setIsReduced(media.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return isReduced;
};

interface IProps {
  kind: TSkyKind;
  isActive: boolean;
}

/** Живой фон капсулы: монтируется только у активной капсулы (сегодня или под курсором). */
export const SkyVideo = ({ kind, isActive }: IProps) => {
  const [isReady, setIsReady] = useState(false);
  const isReducedMotion = usePrefersReducedMotion();
  const src = SKY_VIDEOS[kind];

  useEffect(() => setIsReady(false), [src, isActive]);

  if (!isActive || !src || isReducedMotion) return null;

  // Пока ролик грузится, видна статичная картинка фона — проявляем видео только с первым кадром.
  return (
    <video
      key={src}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
      onPlaying={() => setIsReady(true)}
      className={`sky-card__video ${isReady ? "sky-card__video--ready" : ""}`}
    />
  );
};
