import React from "react";
import { IFolderLabelProps } from "../model";
import { FolderCounter } from "./FolderCounter";
import { FolderActions } from "./FolderActions";
// Поправить троеточие)
export const FolderLabel: React.FC<IFolderLabelProps> = ({
  folder,
  folderPath,
  collapsed,
  definition,
  menuActions,
  onNavigate,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  isDraggable,
}) => {
  return (
    <div
      className="flex items-center justify-between w-full group overflow-hidden pr-6"
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        className="flex items-center flex-1 min-w-0 cursor-pointer gap-2"
        onClick={(e) => {
          e.stopPropagation();
          if (folderPath) {
            onNavigate(folderPath);
          }
        }}
      >
        <span className="truncate">{folder.name}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-1">
        <FolderActions menuActions={menuActions} collapsed={collapsed} />
        <FolderCounter definition={definition} collapsed={collapsed} />
      </div>
    </div>
  );
};
