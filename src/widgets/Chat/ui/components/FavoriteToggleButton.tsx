import { Star } from "lucide-react";
import { Tooltip } from "@shared/ui";

interface IProps {
  isStarred: boolean;
  addLabel: string;
  removeLabel: string;
  onToggle: () => void;
  className?: string;
}

/**
 * Звёздочка «В избранное» в строке списка чатов. Строка сама кнопка, поэтому эта
 * кнопка лежит рядом с ней (абсолютно, поверх), а не внутри: вложенные кнопки
 * недопустимы. Избранная беседа показывает закрашенную звезду всегда, остальные —
 * контур только при наведении на строку или фокусе.
 */
export const FavoriteToggleButton = ({
  isStarred,
  addLabel,
  removeLabel,
  onToggle,
  className = "",
}: IProps) => {
  const label = isStarred ? removeLabel : addLabel;

  return (
    <Tooltip title={label} placement="left">
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        aria-pressed={isStarred}
        className={`flex items-center justify-center w-7 h-7 rounded-full transition-[opacity,background-color,color] duration-200 cursor-pointer hover:bg-[var(--th-hover-bg-strong)] focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[rgb(var(--th-accent-rgb)/0.5)] ${
          isStarred
            ? "text-amber-400 opacity-100"
            : "text-[var(--th-text-faint)] hover:text-amber-400 opacity-0 group-hover/row:opacity-100"
        } ${className}`}
      >
        <Star className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`} />
      </button>
    </Tooltip>
  );
};
