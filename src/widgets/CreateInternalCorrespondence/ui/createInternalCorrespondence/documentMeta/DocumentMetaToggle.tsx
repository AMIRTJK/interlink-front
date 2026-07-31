import { ChevronDown } from "lucide-react";

import { cn } from "../../../lib/utils";
import type { ILetterTypeOption } from "./model";

interface IProps {
  formExpanded: boolean;
  onToggle: () => void;
  letterType: string | null;
  letterTypeOptions: ILetterTypeOption[];
  subject: string;
}

export const DocumentMetaToggle = ({
  formExpanded,
  onToggle,
  letterType,
  letterTypeOptions,
  subject,
}: IProps) => (
  <div
    onClick={onToggle}
    className="px-6 py-3 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 select-none transition-colors"
  >
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Реквизиты документа
      </span>
      {!formExpanded && (
        <div className="flex items-center gap-1.5 ml-2">
          {letterType && (
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100">
              {letterTypeOptions.find((o) => o.value === letterType)?.label ?? letterType}
            </span>
          )}
          {subject && (
            <span className="text-slate-500 text-xs truncate max-w-[200px] font-medium">
              — {subject}
            </span>
          )}
        </div>
      )}
    </div>
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-400">
        {formExpanded ? "Свернуть" : "Развернуть"}
      </span>
      <ChevronDown
        size={14}
        className={cn(
          "text-slate-400 transition-transform duration-200",
          formExpanded && "rotate-180",
        )}
      />
    </div>
  </div>
);
