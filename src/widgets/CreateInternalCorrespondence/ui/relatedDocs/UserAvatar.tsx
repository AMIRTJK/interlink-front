import React from "react";
import { cn } from "@shared/lib";
import { AVATAR_COLORS, getInitials } from "./relatedDocsModel";

interface IProps {
  photoUrl?: string | null;
  name?: string;
  className?: string;
}

export const UserAvatar: React.FC<IProps> = ({
  photoUrl,
  name,
  className,
}) => {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name || ""}
        className={cn(
          "w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs",
          className,
        )}
      />
    );
  }
  const colorIdx =
    (name || "")
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length;

  return (
    <div
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border shadow-2xs",
        AVATAR_COLORS[colorIdx],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
};

