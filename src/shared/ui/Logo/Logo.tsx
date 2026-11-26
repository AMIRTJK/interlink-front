import { CSSProperties, FC } from "react";
import { LOGO_PATH, LOGO_VIEW_BOX } from "./model";

interface IProps {
  /** Доп. классы (размер шрифта и цвет задаём здесь: `text-xl text-zinc-900 dark:text-white`). */
  className?: string;
  style?: CSSProperties;
}

/**
 * Логотип системы — «INFRATECH».
 *
 * Векторный знак, встроенный инлайном, а не <img>: заливка currentColor
 * наследует цвет текста (светлая/тёмная тема), а высота в em сохраняет
 * прежнее управление размером через font-size родителя.
 * Отдельный файл того же знака — public/images/infratech-logo.svg.
 */
export const Logo: FC<IProps> = ({ className = "", style }) => (
  <svg
    role="img"
    aria-label="INFRATECH"
    viewBox={LOGO_VIEW_BOX}
    fill="currentColor"
    className={`inline-block shrink-0 select-none h-[0.72em] w-auto ${className}`}
    style={style}
  >
    <path d={LOGO_PATH} />
  </svg>
);
