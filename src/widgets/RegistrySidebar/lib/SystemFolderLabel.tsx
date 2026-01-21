import React from "react";
import { FolderDefinition } from "./types";

interface SystemFolderLabelProps {
  name: string;
  definition: FolderDefinition;
  collapsed: boolean;
  onNavigate: (path: string) => void;
}

export const SystemFolderLabel: React.FC<SystemFolderLabelProps> = ({
  name,
  definition,
  collapsed,
  onNavigate,
}) => {
  return (
    <div className="flex items-center w-full overflow-hidden h-full gap-0">
      <div
        className="flex items-center flex-1 overflow-hidden cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          if (definition.path) {
            onNavigate(definition.path);
          }
        }}
      >
        <span className="truncate flex-1 pr-1">{name}</span>
      </div>

      <div className="w-10 shrink-0 flex items-center justify-center">
        {definition.count !== undefined &&
          definition.count > 0 &&
          !collapsed && (
            <span className="bg-[#E30613] text-white text-[11px] font-bold px-1.5 rounded-full min-w-6 h-6 flex items-center justify-center">
              {definition.count}
            </span>
          )}
      </div>

      {/* Empty cell for alignment with folders that have buttons/arrows */}
      <div className="w-10 shrink-0" />
    </div>
  );
};
