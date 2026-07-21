import { Pagination } from "antd";
import { IApiFile } from "./lib";
import { If } from "@shared/ui";
import { FileGrid } from "./FileGrid";
import { FileList } from "./FileList";

interface IPagination {
  total: number;
  currentPage: number;
  perPage: number;
}

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
  pagination?: IPagination;
  onPageChange?: (page: number) => void;
  onSelectAll?: (ids: number[]) => void;
  onDeselectAll?: (ids: number[]) => void;
  onReorderFiles?: (fileIds: number[]) => void;
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
  pagination,
  onPageChange,
  onSelectAll,
  onDeselectAll,
  onReorderFiles,
}: IProps) => {
  return (
    <div className="space-y-4">
      <If is={viewMode === "grid"}>
        <FileGrid
          files={files}
          selectedFileIds={selectedFileIds}
          onToggleSelectFile={onToggleSelectFile}
          showSelection={showSharedWith}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
          onView={onView}
          onMove={onMove}
          onShare={onShare}
          onReorderFiles={onReorderFiles}
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
          onSelectAll={onSelectAll}
          onDeselectAll={onDeselectAll}
          onReorderFiles={onReorderFiles}
        />
      </If>

      <If is={!!pagination}>
        <div className="flex justify-end pt-2 pr-1">
          <Pagination
            current={pagination!.currentPage}
            total={pagination!.total}
            pageSize={pagination!.perPage}
            onChange={onPageChange}
            showSizeChanger={false}
            showTotal={(total, range) =>
              `${range[0]}–${range[1]} из ${total}`
            }
          />
        </div>
      </If>
    </div>
  );
};
