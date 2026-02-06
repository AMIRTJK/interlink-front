import React from "react";
import { IFolderDefinition } from "../model";

interface IProps {
  name: string;
  definition: IFolderDefinition;
  collapsed: boolean;
  onNavigate: (path: string) => void;
}

export const SystemFolderLabel: React.FC<IProps> = ({
  name,
  definition,
  collapsed,
  onNavigate,
}) => {
  return (
    <div className="flex items-center w-full">
      <div
        className="flex items-center flex-1 overflow-hidden cursor-pointer"
        onClick={() => {
          if (definition.path) {
            onNavigate(definition.path);
          }
        }}
      >
        <span>{name}</span>
      </div>

      <div className="w-auto shrink-0 flex items-center justify-center ml-1">
        {definition.count !== undefined &&
          definition.count > 0 &&
          !collapsed && (
            <span className="bg-[#E30613] text-white text-[10px] font-bold rounded-full min-w-6 h-6 flex items-center justify-center">
              {definition.count}
            </span>
          )}
      </div>

      <div className="w-9" />
    </div>
  );
};
