import * as React from "react";
import { X } from "lucide-react";
import { Avatar } from "@shared/ui";
import { T } from "../../theme/tokens";
import type { ExtUser } from "../../model";

interface IProps {
  user: ExtUser;
  resolvedRoles: string[];
  onClose: () => void;
}

export function UserDrawerHeader({ user, resolvedRoles, onClose }: IProps) {
  return (
    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <Avatar
          colleague={{
            id: user.id,
            name: user.fio,
            initials: user.avatarInitials,
            photo: user.photoUrl,
          }}
          className="w-8 h-8 rounded-full shrink-0"
          allowPreview={true}
        />
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {user.fio}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {resolvedRoles.join(", ") || "Без роли"}
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="bg-transparent border-0 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 p-1 rounded-md flex shrink-0"
      >
        <X size={15} />
      </button>
    </div>
  );
}
