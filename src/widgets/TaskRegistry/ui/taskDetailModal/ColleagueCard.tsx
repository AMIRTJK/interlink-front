import { Tooltip } from "@shared/ui";
import type { Colleague } from "../../model/types";
import { Avatar } from "../Avatar";

interface IProps {
  colleague: Colleague;
}

export const ColleagueCard = ({ colleague }: IProps) => (
  <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm shrink-0 min-h-[64px]">
    <Avatar colleague={colleague} className="w-10 h-10 text-xs shrink-0" />
    <Tooltip
      title={
        <div className="p-0.5 max-w-xs">
          <p className="font-bold text-xs text-white">{colleague.name}</p>
          {colleague.role && (
            <p className="text-[10px] text-slate-300 mt-0.5 font-normal">
              {colleague.role}
            </p>
          )}
        </div>
      }
      placement="topLeft"
    >
      <div className="min-w-0 flex-1 cursor-default">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
          {colleague.name}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
          {colleague.role}
        </p>
      </div>
    </Tooltip>
  </div>
);
