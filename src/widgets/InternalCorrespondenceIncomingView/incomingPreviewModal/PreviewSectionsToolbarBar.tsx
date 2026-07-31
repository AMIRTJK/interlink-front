import React from "react";
import { cn } from "@shared/lib";
import { If, Tooltip } from "@shared/ui";
import { ToolbarSection } from "./incomingPreviewModalModel";

interface IProps {
  sections: ToolbarSection[];
  panelsInToolbar?: boolean;
  onTogglePanelsInToolbar?: (value: boolean) => void;
}

export const PreviewSectionsToolbarBar: React.FC<IProps> = ({
  sections,
  panelsInToolbar,
  onTogglePanelsInToolbar,
}) => {
  return (
    <div className="px-6 py-2 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2 font-sans flex-shrink-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mr-1 select-none">
          Разделы
        </span>
        {sections.map((section) => (
          <Tooltip key={section.key} title={section.hint}>
            <span className="inline-flex">
              <button
                type="button"
                onClick={section.onToggle}
                disabled={section.disabled}
                className={cn(
                  "flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full border text-xs font-semibold transition-all select-none",
                  section.disabled
                    ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    : "cursor-pointer",
                  section.isOpen
                    ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                    : !section.disabled &&
                        "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                    section.dotClass
                  )}
                  style={section.dotStyle}
                />
                <span>{section.label}</span>
                <If
                  is={
                    section.badge !== undefined &&
                    section.badge !== null &&
                    section.badge !== ""
                  }
                >
                  <span
                    className={cn(
                      "text-[10px] font-bold rounded-full px-1.5 py-0.5 flex items-center justify-center flex-shrink-0 min-w-4 h-4",
                      section.isOpen
                        ? "bg-white text-slate-800"
                        : "bg-indigo-100 text-indigo-700"
                    )}
                  >
                    {section.badge}
                  </span>
                </If>
              </button>
            </span>
          </Tooltip>
        ))}
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={Boolean(panelsInToolbar)}
          onChange={(e) => onTogglePanelsInToolbar?.(e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <span>Панель разделов сверху</span>
      </label>
    </div>
  );
};
