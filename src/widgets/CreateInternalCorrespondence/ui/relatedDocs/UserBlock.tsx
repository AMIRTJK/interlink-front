import React from "react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import type { IRelatedDocCreator } from "@widgets/NewRegistry/lib/structure/types";
import { UserAvatar } from "./UserAvatar";

interface IProps {
  user?: IRelatedDocCreator | null;
  kind: "incoming" | "outgoing";
  regNumber?: string;
  isCurrent?: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const UserBlock: React.FC<IProps> = ({
  user,
  kind,
  regNumber,
  isCurrent,
  onClick,
}) => {
  const name = user?.full_name || "Не указан";
  const position = user?.position || "Сотрудник";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 min-w-0 p-2.5 rounded-xl transition-all cursor-pointer group/user flex-1",
        isCurrent
          ? "bg-blue-50/90 border border-blue-200 shadow-2xs"
          : "bg-slate-50/80 hover:bg-slate-100/90 border border-slate-100 hover:border-slate-200",
      )}
      title={`${name} • ${position}`}
    >
      <UserAvatar photoUrl={user?.photo_url} name={name} />
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold text-slate-800 group-hover/user:text-blue-600 transition-colors truncate">
            {name}
          </span>
          <If is={Boolean(isCurrent)}>
            <span className="px-1.5 py-0.5 text-[8px] font-extrabold bg-blue-600 text-white rounded uppercase tracking-wider shrink-0">
              Текущий
            </span>
          </If>
        </div>
        <span className="text-[11px] text-slate-500 font-medium truncate leading-tight mt-0.5">
          {position}
        </span>
        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-mono">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              kind === "incoming" ? "bg-emerald-500" : "bg-blue-500",
            )}
          />
          <span className="truncate font-medium text-slate-500">
            {kind === "incoming" ? "Вх." : "Исх."}{" "}
            {regNumber ? `№ ${regNumber}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

