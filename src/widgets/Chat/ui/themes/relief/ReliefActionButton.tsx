import type { ElementType, MouseEventHandler } from "react";
import { toneStyle, type TReliefTone } from "./model";

// Объёмная круглая кнопка — основной орган управления макета: блик сверху,
// цветная заливка, опора снизу. Форма и тени живут в CSS (.chat-relief-action),
// сюда приходит только тон и иконка, поэтому кнопки шапки, поля ввода и панели
// бесед выглядят одинаково и перекрашиваются вместе с темой.

interface IProps {
  Icon: ElementType;
  label: string;
  tone: TReliefTone;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  /** Нажатое состояние: кнопка «вдавливается» (открытый поиск, панель сведений). */
  isActive?: boolean;
  /** Диаметр кнопки в px: 40 в шапке, 36 в поле ввода — как в макете. */
  size?: number;
  /** Размер иконки в px. По умолчанию — половина диаметра. */
  iconSize?: number;
  className?: string;
}

export const ReliefActionButton = ({
  Icon,
  label,
  tone,
  onClick,
  disabled,
  isActive,
  size = 40,
  iconSize,
  className = "",
}: IProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    // Кнопки без переключаемого состояния не должны объявлять его вовсе:
    // aria-pressed="false" на обычной кнопке читается как «выключено».
    aria-pressed={isActive === undefined ? undefined : isActive}
    title={label}
    className={`chat-relief-action ${className}`}
    style={{ ...toneStyle(tone), width: size, height: size }}
  >
    <Icon style={{ width: iconSize ?? size / 2, height: iconSize ?? size / 2 }} />
  </button>
);
