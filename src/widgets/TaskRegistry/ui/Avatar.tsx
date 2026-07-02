import { cn } from "@shared/lib";
import type { Colleague } from "../model/types";

export const Avatar = ({
  colleague,
  className,
}: {
  colleague: Colleague;
  className?: string;
}) => (
  <div
    className={cn(
      "relative flex items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0",
      colleague.color,
      className || "w-8 h-8",
    )}
  >
    <span>{colleague.initials}</span>
  </div>
);
