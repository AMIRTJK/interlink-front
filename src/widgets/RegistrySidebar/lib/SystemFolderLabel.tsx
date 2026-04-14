import React from "react";
import { IFolderDefinition } from "../model";

import { Count } from "@shared/ui";

interface IProps {
  name: string;
  definition: IFolderDefinition;
  onNavigate: (path: string) => void;
  collapsed?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const SystemFolderLabel: React.FC<IProps> = ({
  name,
  definition,
  onNavigate,
  collapsed: _collapsed,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {

  return (
    <div 
      className="flex items-center w-full"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        className="flex items-center flex-1 overflow-hidden cursor-pointer"
        onClick={() => {
          if (definition?.path) {
            onNavigate(definition?.path);
          }
        }}
      >
        <span>{name}</span>
      </div>

      <div className="w-auto shrink-0 flex items-center justify-center ml-1">
        <Count count={definition?.count} />
      </div>

      <div className="w-9" />
    </div>
  );
};

