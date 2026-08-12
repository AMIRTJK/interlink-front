import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { IApprovalVersionWarning } from "../model";

interface IProps {
  warning: IApprovalVersionWarning | null;
  isDarkMode?: boolean;
  /** Компактный вид для узких панелей: без разбивки по версиям. */
  isCompact?: boolean;
}

const MAX_VISIBLE_NAMES = 3;

/** «1 согласующий одобрил» против «6 согласующих одобрили». */
const isSingular = (count: number) => count % 10 === 1 && count % 100 !== 11;

const approversWord = (count: number) =>
  isSingular(count) ? "согласующий" : "согласующих";

const approvedVerb = (count: number) =>
  isSingular(count) ? "одобрил" : "одобрили";

const namesPreview = (names: string[], count: number) => {
  const visible = names.slice(0, MAX_VISIBLE_NAMES).join(", ");
  const rest = count - Math.min(names.length, MAX_VISIBLE_NAMES);
  return rest > 0 ? `${visible} и ещё ${rest}` : visible;
};

/**
 * Предупреждение перед согласованием: какую версию согласует пользователь и на
 * каких версиях приняли решение остальные участники.
 */
export const ApprovalVersionNotice = ({
  warning,
  isDarkMode,
  isCompact,
}: IProps) => {
  if (!warning) return null;

  if (!warning.hasMismatch) {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed",
          isDarkMode
            ? "border-emerald-800/50 bg-emerald-950/30 text-emerald-200"
            : "border-emerald-200/80 bg-emerald-50/80 text-emerald-900",
        )}
      >
        <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
        <span>
          Вы согласуете{" "}
          <span className="font-semibold">{warning.targetLabel}</span>
          <If is={warning.matchedCount > 0}>
            <span>
              {" "}
              — её же {approvedVerb(warning.matchedCount)}{" "}
              {warning.matchedCount} {approversWord(warning.matchedCount)}.
            </span>
          </If>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-relaxed",
        isDarkMode
          ? "border-amber-800/60 bg-amber-950/30 text-amber-100"
          : "border-amber-300/80 bg-amber-50/90 text-amber-900",
      )}
    >
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">
          Вы согласуете {warning.targetLabel}, а {warning.mismatchedCount}{" "}
          {approversWord(warning.mismatchedCount)}{" "}
          {approvedVerb(warning.mismatchedCount)} другую версию документа
        </p>
        <If is={!isCompact}>
          <ul className="mt-1.5 flex flex-col gap-1">
            {warning.groups.map((group) => (
              <li key={String(group.versionId ?? "unknown")}>
                <span className="font-semibold">{group.label}</span> —{" "}
                {group.count} {approversWord(group.count)}
                <If is={group.approverNames.length > 0}>
                  <span className="opacity-80">
                    : {namesPreview(group.approverNames, group.count)}
                  </span>
                </If>
              </li>
            ))}
          </ul>
        </If>
        <If is={warning.matchedCount > 0}>
          <p className="mt-1.5 opacity-80">
            Текущую версию {approvedVerb(warning.matchedCount)}{" "}
            {warning.matchedCount} {approversWord(warning.matchedCount)}.
          </p>
        </If>
      </div>
    </div>
  );
};
