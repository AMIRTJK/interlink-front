import React from "react";
import { IApiFile } from "./lib";
import { If } from "@shared/ui";
import { FileGrid } from "./FileGrid";
import { FileList } from "./FileList";

interface IProps {
  files: IApiFile[];
  viewMode: "grid" | "list";
  selectedFileIds: number[];
  onToggleSelectFile: (id: number) => void;
  onView: (file: IApiFile) => void;
  onTogglePin: (file: IApiFile) => void;
  onDelete: (id: number) => void;
  onMove?: (file: IApiFile) => void;
}

export const FileGridList = ({
  files,
  viewMode,
  selectedFileIds,
  onToggleSelectFile,
  onView,
  onTogglePin,
  onDelete,
  onMove,
}: IProps) => {
  return (
    <div>
      <If is={viewMode === "grid"}>
        <FileGrid
          files={files}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
          onView={onView}
          onMove={onMove}
        />
      </If>

      <If is={viewMode === "list"}>
        <FileList
          files={files}
          selectedFileIds={selectedFileIds}
          onToggleSelectFile={onToggleSelectFile}
          onView={onView}
          onDelete={onDelete}
          onMove={onMove}
        />
      </If>
    </div>
  );
};
