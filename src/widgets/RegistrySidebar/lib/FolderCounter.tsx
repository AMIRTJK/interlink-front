import React from "react";
import { IFolderDefinition } from "./types";

interface IProps {
  definition?: IFolderDefinition;
  collapsed: boolean;
}

export const FolderCounter: React.FC<IProps> = ({ definition, collapsed }) => {
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
