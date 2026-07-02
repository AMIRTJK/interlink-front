import React, { useState, useMemo, useRef } from "react";
import { useFilesData } from "./files/useFilesData";
import { FilesHeader } from "./files/FilesHeader";
import { CategoryFilters } from "./files/CategoryFilters";
import { PinnedFiles } from "./files/PinnedFiles";
import { FileGridList } from "./files/FileGridList";
import { StorageUsage } from "./files/StorageUsage";
import { FilePreviewModal } from "./files/FilePreviewModal";
import { FolderActionsModal } from "./files/FolderActionsModal";
import { MoveToFolderModal } from "./files/MoveToFolderModal";
import { IApiFile, IApiFolder } from "./files/lib";
import { Modal } from "antd";
import { Upload } from "lucide-react";
import "./FilesTab.css";

export const FilesTab = () => {
  const [activeFolderId, setActiveFolderId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "size" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [previewFile, setPreviewFile] = useState<IApiFile | null>(null);
  const [movingFile, setMovingFile] = useState<IApiFile | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderModalTitle, setFolderModalTitle] = useState("");
  const [editingFolder, setEditingFolder] = useState<IApiFolder | null>(null);

  // Queries & Mutations
  const {
    files,
    folders,
    meta,
    isLoadingFiles,
    createFolder,
    updateFolder,
    deleteFolder,
    updateFile,
    deleteFile,
    uploadFile,
  } = useFilesData({ search: searchQuery, sort: sortBy, dir: sortDir });

  // Toggle selection
  const handleToggleSelectFile = (id: number) => {
    setSelectedFileIds((prev) =>
      prev.includes(id) ? prev.filter((fileId) => fileId !== id) : [...prev, id]
    );
  };

  // Upload handler
  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    if (typeof activeFolderId === "number") {
      formData.append("folder_id", String(activeFolderId));
    }
    uploadFile.mutate(formData);
  };

  // Folder Actions
  const handleCreateFolderSubmit = (name: string) => {
    if (editingFolder) {
      updateFolder.mutate({ id: editingFolder.id, name, parent_id: editingFolder.parent_id });
      setEditingFolder(null);
    } else {
      createFolder.mutate({ name, parent_id: null });
    }
  };

  const handleOpenRenameFolder = (folderName: string, id: number) => {
    const folder = folders.find((f) => f.id === id);
    if (folder) {
      setEditingFolder(folder);
      setFolderModalTitle("Переименовать папку");
      setFolderModalOpen(true);
    }
  };

  const handleDeleteFolderConfirm = (id: number) => {
    Modal.confirm({
      title: "Удалить папку?",
      content: "Внимание! Все вложенные файлы и подпапки будут удалены безвозвратно. Вы действительно хотите удалить эту папку?",
      okText: "Удалить",
      okButtonProps: { danger: true, className: "bg-red-600! hover:bg-red-700!" },
      cancelText: "Отмена",
      onOk: () => {
        deleteFolder.mutate({ id });
        setActiveFolderId("all");
      },
    });
  };

  // File Actions
  const handleTogglePin = (file: IApiFile) => {
    updateFile.mutate({ id: file.id, is_starred: !file.is_starred });
  };

  const handleDeleteFileConfirm = (id: number) => {
    Modal.confirm({
      title: "Удалить файл?",
      content: "Вы действительно хотите удалить этот файл?",
      okText: "Удалить",
      okButtonProps: { danger: true, className: "bg-red-600! hover:bg-red-700!" },
      cancelText: "Отмена",
      onOk: () => deleteFile.mutate({ id }),
    });
  };

  const handleMoveFileConfirm = (targetFolderId: number | null) => {
    if (movingFile) {
      updateFile.mutate({ id: movingFile.id, folder_id: targetFolderId });
      setMovingFile(null);
    }
  };

  // Helpers for category filters
  const getFolderIcon = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("рабоч")) return "💼";
    if (n.includes("документ")) return "📄";
    if (n.includes("договор")) return "📑";
    if (n.includes("фото") || n.includes("изображ")) return "🖼️";
    return "📁";
  };

  const categoriesList = useMemo(() => {
    const list = [{ id: "all" as const, name: "Все файлы", icon: "📁" }];
    folders.forEach((f) => {
      list.push({
        id: f.id,
        name: f.name,
        icon: getFolderIcon(f.name),
      });
    });
    return list;
  }, [folders]);

  const pinnedFiles = useMemo(() => {
    return files.filter((f) => f.is_starred);
  }, [files]);

  const currentFiles = useMemo(() => {
    const parentId = activeFolderId === "all" ? null : activeFolderId;
    return files.filter((f) => f.folder_id === parentId);
  }, [files, activeFolderId]);

  return (
    <div className="files-tab-container space-y-6">
      {/* Header */}
      <FilesHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortDir={sortDir}
        onSortDirToggle={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUpload={handleUpload}
        totalCount={files.length}
        onCreateFolderClick={() => {
          setEditingFolder(null);
          setFolderModalTitle("Создать новую папку");
          setFolderModalOpen(true);
        }}
      />

      {/* Category/Folder Filters */}
      <CategoryFilters
        categories={categoriesList}
        activeCategory={activeFolderId}
        onCategorySelect={(id) => setActiveFolderId(id)}
        onAddCategoryClick={() => {
          setEditingFolder(null);
          setFolderModalTitle("Создать новую папку");
          setFolderModalOpen(true);
        }}
        onRenameCategory={(cat) => handleOpenRenameFolder(cat.name, Number(cat.id))}
        onDeleteCategory={handleDeleteFolderConfirm}
      />

      {/* Starred/Pinned Files */}
      <PinnedFiles pinnedFiles={pinnedFiles} onUnpin={handleTogglePin} />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleUpload(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full py-6 border-2 border-dashed rounded-3xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
          isDragOver
            ? "border-indigo-600 bg-indigo-50/30 text-indigo-650"
            : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          className="hidden!"
        />
        <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">
          ↑ Перетащите файлы или нажмите, чтобы загрузить
        </span>
      </div>

      {/* Files Display */}
      {isLoadingFiles ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-sm text-slate-400 dark:text-zinc-500">Загрузка файлов...</p>
        </div>
      ) : (
        <FileGridList
          files={currentFiles}
          viewMode={viewMode}
          selectedFileIds={selectedFileIds}
          onToggleSelectFile={handleToggleSelectFile}
          onView={setPreviewFile}
          onTogglePin={handleTogglePin}
          onDelete={handleDeleteFileConfirm}
          onMove={setMovingFile}
        />
      )}

      {/* Storage usage details */}
      <StorageUsage meta={meta} files={files} />

      {/* Modals */}
      <FolderActionsModal
        isOpen={folderModalOpen}
        onClose={() => {
          setFolderModalOpen(false);
          setEditingFolder(null);
        }}
        onSubmit={handleCreateFolderSubmit}
        initialName={editingFolder?.name || ""}
        title={folderModalTitle}
      />

      <MoveToFolderModal
        isOpen={!!movingFile}
        onClose={() => setMovingFile(null)}
        folders={folders}
        currentFolderId={movingFile?.folder_id || null}
        onConfirm={handleMoveFileConfirm}
        fileName={movingFile?.original_name || ""}
      />

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};
export default FilesTab;
