import React from "react";
import { FolderDefinition } from "../types";

interface FolderCounterProps {
  definition?: FolderDefinition;
  collapsed: boolean;
}

export const FolderCounter: React.FC<FolderCounterProps> = ({ definition, collapsed }) => {
  const count = definition?.count;

  if (count === undefined || collapsed) {
    return null;
  }

  return (
    <span className="bg-[#E30613] text-white text-[11px] font-bold px-1.5 rounded-full min-w-6 h-6 flex items-center justify-center">
      {count}
    </span>
  );
};
