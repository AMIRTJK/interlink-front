import React from "react";
import { FolderLabelProps } from "./types";
import { FolderCounter } from "./FolderCounter";
import { FolderActions } from "./FolderActions";

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
      className="flex items-center w-full group overflow-hidden h-full gap-0"
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{ paddingRight: '40px' }} // Space for expand arrow
    >
      {/* Folder name with ellipsis */}
      <div
        className="flex items-center flex-1 overflow-hidden cursor-pointer min-w-0"
        onClick={(e) => {
          e.stopPropagation();
          if (folderPath) {
            onNavigate(folderPath);
          }
        }}
      >
        <span className="truncate">{folder.name}</span>
      </div>

      {/* Counter badge - fixed width for vertical alignment */}
      <div className="shrink-0 flex items-center justify-end" style={{ width: '40px' }}>
        <FolderCounter definition={definition} collapsed={collapsed} />
      </div>

      {/* Three-dot menu - fixed width, left of expand arrow */}
      <div className="shrink-0 flex items-center justify-center" style={{ width: '32px' }}>
        <FolderActions menuActions={menuActions} collapsed={collapsed} />
      </div>
    </div>
  );
};
