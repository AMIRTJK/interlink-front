import { motion, useReducedMotion } from "framer-motion";

// Медленный «вдох» кадра, как у сцены «Космос»: картинка едва заметно приближается и отдаляется.
const DRIFT_SCALE = 1.04;
const DRIFT_SECONDS = 45;

interface IProps {
  src: string;
  /** Какую часть картинки сохранять, когда пропорции экрана не совпадают с картинкой. */
  objectPosition: string;
}

/** Готовый фон-картинка сцены на весь экран с медленным дрейфом масштаба. */
export const DriftingPlate = ({ src, objectPosition }: IProps) => {
  const isReducedMotion = useReducedMotion();

  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden="true"
      decoding="async"
      className="absolute inset-0 block w-full h-full object-cover"
      style={{ objectPosition }}
      animate={{ scale: isReducedMotion ? 1 : [1, DRIFT_SCALE] }}
      transition={{ duration: DRIFT_SECONDS, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
    />
  );
};
