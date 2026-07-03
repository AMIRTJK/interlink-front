import { CSSProperties, FC } from "react";

interface IProps {
  /** Доп. классы (размер шрифта и цвет задаём здесь: `text-xl text-zinc-900 dark:text-white`). */
  className?: string;
  style?: CSSProperties;
}

/**
 * Логотип системы — «INFRATECH».
 *
 * Рисуется живым текстом шрифтом Orbitron (самостоятельно хостится в
 * /public/fonts, @font-face объявлен в global.css) — тем же, что и в
 * утверждённом макете ЭЦП-штампа. Живой текст, а не картинка, потому что:
 *   • цвет наследуется (currentColor) → корректно работает в светлой и тёмной теме;
 *   • масштабируется без потери чёткости;
 *   • единый источник бренда для всех мест приложения.
 *
 * Размер и цвет управляются классами родителя/пропом className.
 */
export const Logo: FC<IProps> = ({ className = "", style }) => (
  <span
    aria-label="INFRATECH"
    className={`inline-block whitespace-nowrap leading-none select-none ${className}`}
    style={{
      fontFamily: '"Orbitron", ui-sans-serif, system-ui, sans-serif',
      fontWeight: 500,
      letterSpacing: "0.25em",
      ...style,
    }}
  >
    INFRATECH
  </span>
);
