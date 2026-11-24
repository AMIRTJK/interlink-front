import type { ReactNode } from "react";
import { cn } from "@shared/lib";

interface IProps {
  label: string;
  children: ReactNode;
  isVertical?: boolean;
  className?: string;
}

/**
 * Смысловая группа кнопок управления: держит кнопки группы рядом и озвучивает её
 * название скринридером через role="group". Своего фона нет — он спорит с кнопками.
 */
export const HeaderButtonGroup = ({
  label,
  children,
  isVertical = false,
  className,
}: IProps) => (
  <div
    role="group"
    aria-label={label}
    className={cn(
      "flex items-center gap-2",
      isVertical ? "flex-col" : "flex-row",
      className,
    )}
  >
    {children}
  </div>
);
