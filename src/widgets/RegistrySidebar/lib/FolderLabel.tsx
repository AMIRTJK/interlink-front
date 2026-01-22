import React from "react";
import { FolderLabelProps } from "./types";
import { FolderCounter } from "./FolderCounter";
import { FolderActions } from "./FolderActions";
// Поправить троеточие)
export const FolderLabel: React.FC<FolderLabelProps> = ({
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
      className="flex items-center"
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      
      <div
        className="flex items-center flex-1 cursor-pointer min-w-[125px] max-w-[101px]"
        onClick={(e) => {
          e.stopPropagation();
          if (folderPath) {
            onNavigate(folderPath);
          }
        }}
      >
        <span className="mr-auto!">{folder.name}</span>
        <FolderActions menuActions={menuActions} collapsed={collapsed} />
      </div>

      <div
        className="flex items-center justify-end"
        style={{ width: "40px" }}
      >
        <FolderCounter definition={definition} collapsed={collapsed} />
      </div>
      
    </div>
  );
};
