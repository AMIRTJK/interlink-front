import React from "react";
import { IFileItem } from "../mockData";
import { If } from "@shared/ui";
import { FileGrid } from "./FileGrid";
import { FileList } from "./FileList";

interface IProps {
  files: IFileItem[];
  viewMode: "grid" | "list";
  selectedFileIds: string[];
  onToggleSelectFile: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

export const FileGridList = ({
  files,
  viewMode,
  selectedFileIds,
  onToggleSelectFile,
  onTogglePin,
  onDelete,
}: IProps) => {
  return (
    <div>
      <If is={viewMode === "grid"}>
        <FileGrid
          files={files}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
        />
      </If>

      <If is={viewMode === "list"}>
        <FileList
          files={files}
          selectedFileIds={selectedFileIds}
          onToggleSelectFile={onToggleSelectFile}
          onDelete={onDelete}
        />
      </If>
    </div>
  );
};
