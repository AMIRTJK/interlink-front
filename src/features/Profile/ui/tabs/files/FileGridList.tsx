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
  onTogglePin?: (file: IApiFile) => void;
  onDelete?: (id: number) => void;
  onMove?: (file: IApiFile) => void;
  onShare?: (file: IApiFile) => void;
  showSharedWith?: boolean;
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
  onShare,
  showSharedWith,
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
          onShare={onShare}
        />
      </If>

      <If is={viewMode === "list"}>
        <FileList
          files={files}
          selectedFileIds={selectedFileIds}
          onToggleSelectFile={onToggleSelectFile}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
          onView={onView}
          onMove={onMove}
          onShare={onShare}
          showSharedWith={showSharedWith}
        />
      </If>
    </div>
  );
};
