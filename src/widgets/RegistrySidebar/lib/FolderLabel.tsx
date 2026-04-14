import React from "react";
import { IFolderLabelProps } from "../model";
import { Count } from "@shared/ui";
import { FolderActions } from "./FolderActions";
export const FolderLabel: React.FC<IFolderLabelProps> = ({
  folder,
  folderPath,
  collapsed,
  definition,
  menuActions,
  onNavigate,
}) => {
  return (
    <div
      className="flex items-center justify-between w-full group overflow-hidden pr-2"
    >
      <div
        className="flex items-center cursor-pointer"
        onClick={() => {
          if (folderPath) {
            onNavigate(folderPath);
          }
        }}
      >
        <span className="truncate">{folder.name}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-1">
        <FolderActions menuActions={menuActions} collapsed={collapsed} />
        <Count count={definition?.count} />
      </div>
    </div>
  );
};

