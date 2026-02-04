import React from "react";
import { IFolderDefinition } from "../model";

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
    <span className="bg-[#E30613] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0 leading-none">
      {count}
    </span>
  );
};
