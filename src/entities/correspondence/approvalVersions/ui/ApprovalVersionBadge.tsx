import { FileClock } from "lucide-react";
import { cn } from "@shared/lib";
import { Tooltip } from "@shared/ui";

interface IProps {
  /** Готовая подпись версии, например «Версия 3.0». */
  label: string | null;
  /** Версия решения отличается от версии, выбранной для подписи. */
  isMismatch?: boolean;
  isDarkMode?: boolean;
}

/** Версия документа, на которой участник принял решение о согласовании. */
export const ApprovalVersionBadge = ({
  label,
  isMismatch,
  isDarkMode,
}: IProps) => {
  if (!label) return null;

  return (
    <Tooltip
      title={
        isMismatch
          ? `Согласовано на другой версии: ${label}`
          : `Согласовано на версии: ${label}`
      }
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap",
          isMismatch
            ? isDarkMode
              ? "border-amber-800/60 bg-amber-950/40 text-amber-200"
              : "border-amber-200 bg-amber-50 text-amber-700"
            : isDarkMode
              ? "border-gray-700 bg-gray-800 text-gray-300"
              : "border-gray-200 bg-gray-50 text-gray-600",
        )}
      >
        <FileClock size={10} />
        {label}
      </span>
    </Tooltip>
  );
};
