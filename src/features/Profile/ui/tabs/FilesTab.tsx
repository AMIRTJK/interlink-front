import React, { useState, useRef } from "react";
import { useFilesData } from "./files/useFilesData";
import { FilesHeader } from "./files/FilesHeader";
import { CategoryFilters } from "./files/CategoryFilters";
import { PinnedFiles } from "./files/PinnedFiles";
import { FileGridList } from "./files/FileGridList";
import { StorageUsage } from "./files/StorageUsage";
import { FilePreviewModal } from "./files/FilePreviewModal";
import { FolderActionsModal } from "./files/FolderActionsModal";
import { AddCategoryModal } from "./files/AddCategoryModal";
import { MoveToFolderModal } from "./files/MoveToFolderModal";
import { Upload, ChevronRight, Folder, Share2, Trash2 } from "lucide-react";
import { BulkShareModal } from "./files/BulkShareModal";
import { ShareFileModal } from "./files/ShareFileModal";
import { FilesAnalytics } from "./files/FilesAnalytics";
import { IApiFile, IApiFolder } from "./files/lib";
import { Modal } from "antd";
import { If } from "@shared/ui";
import { toast } from "@shared/lib/toast";
import "./FilesTab.css";

export const FilesTab = () => {
	const [activeFolderId, setActiveFolderId] = useState<number | "all">("all");
	const [viewContext, setViewContext] = useState<"personal" | "shared" | "analytics">("personal");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<"date" | "size" | "name">("date");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
	const [isDragOver, setIsDragOver] = useState(false);
	const [filesPage, setFilesPage] = useState(1);

	const fileInputRef = useRef<HTMLInputElement>(null);

	// Modals state
	const [previewFile, setPreviewFile] = useState<IApiFile | null>(null);
	const [movingFile, setMovingFile] = useState<IApiFile | null>(null);
	const [folderModalOpen, setFolderModalOpen] = useState(false);
	const [folderModalTitle, setFolderModalTitle] = useState("");
	const [editingFolder, setEditingFolder] = useState<IApiFolder | null>(null);
	const [addCategoryOpen, setAddCategoryOpen] = useState(false);
	const [shareItem, setShareItem] = useState<{ item: IApiFile | IApiFolder; type: "file" | "folder" } | null>(null);
	const [isBulkShareOpen, setIsBulkShareOpen] = useState(false);

	// Queries & Mutations
	const {
		files,
		filesPagination,
		folders,
		meta,
		isLoadingFiles,
		categoriesList,
		sharedCategoriesList,
		activeCategoryId,
		pinnedFiles,
		currentFiles: personalCurrentFiles,
		currentFolders: personalCurrentFolders,

		sharedFiles,
		sharedFilesPagination,
		sharedFolders,
		isLoadingSharedFiles,
		createFolder,
		updateFolder,
		deleteFolder,
		updateFile,
		deleteFile,
		uploadFile,
		inviteToFile,
		removeFileShare,
		inviteToFolder,
		removeFolderShare,
		bulkShareFiles,
		bulkDeleteFiles,
	} = useFilesData({
		search: searchQuery,
		sort: sortBy,
		dir: sortDir,
		activeFolderId,
		page: filesPage,
	});

	const currentFiles = viewContext === "shared" ? sharedFiles : personalCurrentFiles;
	const currentFolders = viewContext === "shared" ? sharedFolders : personalCurrentFolders;
	const isLoadingCurrent = viewContext === "shared" ? isLoadingSharedFiles : isLoadingFiles;

	// Toggle selection
	const handleToggleSelectFile = (id: number) => {
		setSelectedFileIds((prev) =>
			prev.includes(id)
				? prev.filter((fileId) => fileId !== id)
				: [...prev, id],
		);
	};

	// Upload handler
	const handleUpload = (file: File) => {
		const formData = new FormData();
		formData.append("files[]", file);
		if (typeof activeFolderId === "number") {
			formData.append("folder_id", String(activeFolderId));
		}
		uploadFile.mutate(formData);
	};

	// Folder Actions
	const handleCreateFolderSubmit = (name: string, emoji: string | null) => {
		updateFolder.mutate({
			id: editingFolder!.id,
			name,
			parent_id: editingFolder!.parent_id,
			...(emoji !== undefined ? { emoji } : {}),
		});
		setEditingFolder(null);
	};

	const handleAddCategorySubmit = (payload: { name: string; icon?: string; allowed_user_ids?: number[] }) => {
		createFolder.mutate({
			name: payload.name,
			parent_id: null,
			...(payload.icon ? { icon: payload.icon } : {}),
			...(payload.allowed_user_ids ? { allowed_user_ids: payload.allowed_user_ids } : {}),
		} as any);
	};

	const handleOpenRenameFolder = (folderName: string, id: number) => {
		const folder = folders.find((f) => Number(f.id) === Number(id));
		if (folder) {
			setEditingFolder(folder);
			setFolderModalTitle("Переименовать папку");
			setFolderModalOpen(true);
		}
	};

	const handleDeleteFolderConfirm = (id: number) => {
		Modal.confirm({
			title: "Удалить папку?",
			content:
				"Папка и всё её содержимое будут удалены: вложенные папки любого уровня, все файлы внутри них и предоставленные доступы. Действие необратимо.",
			okText: "Удалить",
			okButtonProps: {
				danger: true,
				className: "bg-red-600! hover:bg-red-700!",
			},
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
			okButtonProps: {
				danger: true,
				className: "bg-red-600! hover:bg-red-700!",
			},
			cancelText: "Отмена",
			onOk: () => deleteFile.mutate({ id }),
		});
	};

	const handleBulkDeleteConfirm = () => {
		Modal.confirm({
			title: "Удалить выбранные файлы?",
			content: `Вы действительно хотите удалить выбранные файлы (${selectedFileIds.length} шт.)? Действие необратимо.`,
			okText: "Удалить",
			okButtonProps: {
				danger: true,
				className: "bg-red-600! hover:bg-red-700!",
			},
			cancelText: "Отмена",
			onOk: async () => {
				try {
					const res = await bulkDeleteFiles.mutateAsync({ file_ids: selectedFileIds });
					toast.success(`Успешно удалено файлов: ${res.data.deleted_files_count}`);
					if (res.data.storage_cleanup_failed) {
						toast.warning("Часть файлов не удалось очистить из хранилища. Обратитесь к администратору.");
					}
					setSelectedFileIds([]);
				} catch (err) {
					console.error(err);
				}
			},
		});
	};

	const handleMoveFileConfirm = (targetFolderId: number | null) => {
		if (movingFile) {
			updateFile.mutate({ id: movingFile.id, folder_id: targetFolderId });
			setMovingFile(null);
		}
	};

	return (
		<div className="files-tab-container space-y-6">
			{/* Header */}
			<FilesHeader
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				sortBy={sortBy}
				onSortChange={setSortBy}
				sortDir={sortDir}
				onSortDirToggle={() =>
					setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))
				}
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				onUpload={handleUpload}
				personalCount={folders.length}
				sharedCount={sharedFolders.length}
				onCreateFolderClick={() => setAddCategoryOpen(true)}
				viewContext={viewContext}
				onViewContextChange={(ctx) => {
					setViewContext(ctx);
					setActiveFolderId("all");
					setFilesPage(1);
				}}
			/>

			{/* Analytics View */}
			<If is={viewContext === "analytics"}>
				<FilesAnalytics onView={setPreviewFile} />
			</If>

			<If is={viewContext !== "analytics"}>
				<div className="space-y-6">
					{/* Category/Folder Filters */}
					<CategoryFilters
				categories={viewContext === "shared" ? sharedCategoriesList : categoriesList}
				activeCategory={activeCategoryId}
				onCategorySelect={(id) => {
					setActiveFolderId(id);
					setFilesPage(1);
				}}
				onAddCategoryClick={viewContext === "personal" ? () => setAddCategoryOpen(true) : undefined}
				onRenameCategory={viewContext === "personal" ? (cat) => handleOpenRenameFolder(cat.name, Number(cat.id)) : undefined}
				onDeleteCategory={viewContext === "personal" ? handleDeleteFolderConfirm : undefined}
				onShareCategory={viewContext === "personal" ? (cat) => {
					const folder = folders.find((f) => f.id === Number(cat.id));
					if (folder) setShareItem({ item: folder, type: "folder" });
				} : undefined}
			/>



			{/* Starred/Pinned Files */}
			<If is={viewContext === "personal"}>
				<PinnedFiles pinnedFiles={pinnedFiles} onUnpin={handleTogglePin} />
			</If>

			{/* Drag & Drop Zone */}
			<If is={viewContext === "personal"}>
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
							? "border-indigo-600 bg-indigo-50/30 text-indigo-600"
							: "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
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
			</If>

			{/* Files & Subfolders Display */}
			{isLoadingCurrent ? (
				<div className="flex flex-col items-center justify-center py-20 text-slate-400">
					<div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
					<p className="text-sm font-semibold tracking-wide">
						Загрузка файлов...
					</p>
				</div>
			) : currentFiles.length === 0 && currentFolders.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-24 text-slate-400">
					<div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-2xl">
						📭
					</div>
					<h3 className="text-base font-bold text-slate-600 dark:text-zinc-300 mb-1">
						Пусто
					</h3>
					<p className="text-xs font-semibold max-w-xs text-center leading-relaxed">
						{viewContext === "shared" ? "Вам еще не открывали доступ к файлам" : "В этой папке пока нет файлов."}
					</p>
				</div>
			) : (
				<div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
					{/* Files View */}
					<FileGridList
						files={currentFiles}
						viewMode={viewMode}
						selectedFileIds={selectedFileIds}
						onToggleSelectFile={handleToggleSelectFile}
						onView={setPreviewFile}
						onTogglePin={viewContext === "personal" ? handleTogglePin : undefined}
						onDelete={viewContext === "personal" ? handleDeleteFileConfirm : undefined}
						onMove={viewContext === "personal" ? setMovingFile : undefined}
						onShare={viewContext === "personal" ? (file) => setShareItem({ item: file, type: "file" }) : undefined}
						showSharedWith={viewContext === "personal"}
						pagination={filesPagination}
						onPageChange={setFilesPage}
						onSelectAll={(ids) => setSelectedFileIds((prev) => Array.from(new Set([...prev, ...ids])))}
						onDeselectAll={(ids) => setSelectedFileIds((prev) => prev.filter((id) => !ids.includes(id)))}
					/>
				</div>
			)}

			{/* Storage usage details */}
			<If is={viewContext === "personal"}>
				<StorageUsage meta={meta} files={files} />
			</If>
				</div>
			</If>

			{/* Modals */}
			<AddCategoryModal
				isOpen={addCategoryOpen}
				onClose={() => setAddCategoryOpen(false)}
				onSubmit={(payload) => {
					createFolder.mutateAsync({
						...payload,
						parent_id: null,
					});
					setAddCategoryOpen(false);
				}}
			/>

			<FolderActionsModal
				isOpen={folderModalOpen}
				onClose={() => {
					setFolderModalOpen(false);
					setEditingFolder(null);
				}}
				initialName={editingFolder?.name || ""}
				initialEmoji={editingFolder?.emoji || null}
				title={folderModalTitle}
				onSubmit={async (name, emoji) => {
					if (editingFolder) {
						await updateFolder.mutateAsync({
							id: editingFolder.id,
							name,
							emoji,
							parent_id: null,
						});
					}
					setFolderModalOpen(false);
				}}
			/>

			<MoveToFolderModal
				isOpen={!!movingFile}
				onClose={() => setMovingFile(null)}
				folders={folders}
				currentFolderId={movingFile?.folder_id || null}
				onConfirm={handleMoveFileConfirm}
				fileName={movingFile?.original_name || ""}
			/>

			<FilePreviewModal
				file={previewFile}
				onClose={() => setPreviewFile(null)}
			/>

			{shareItem && (
				<ShareFileModal
					item={shareItem.item}
					type={shareItem.type}
					onClose={() => setShareItem(null)}
					onInvite={(userId) => {
						if (shareItem.type === "file") {
							return inviteToFile.mutateAsync({ id: shareItem.item.id, user_id: userId });
						} else {
							return inviteToFolder.mutateAsync({ id: shareItem.item.id, user_id: userId });
						}
					}}
					onRemoveShare={(shareId) => {
						if (shareItem.type === "file") {
							return removeFileShare.mutateAsync({ id: shareItem.item.id, shareId });
						} else {
							return removeFolderShare.mutateAsync({ id: shareItem.item.id, shareId });
						}
					}}
				/>
			)}

			<If is={selectedFileIds.length > 0 && viewContext === "personal"}>
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-6 py-3.5 shadow-2xl flex items-center gap-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
					<span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
						Выбрано файлов: {selectedFileIds.length}
					</span>
					<div className="h-4 w-px bg-slate-250 dark:bg-slate-750" />
					<button
						onClick={() => setIsBulkShareOpen(true)}
						className="flex items-center gap-2 bg-indigo-600! hover:bg-indigo-700! text-white! px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer hover:opacity-90"
					>
						<Share2 size={13} />
						<span>Поделиться</span>
					</button>
					<button
						onClick={handleBulkDeleteConfirm}
						className="flex items-center gap-2 bg-red-600! hover:bg-red-700! text-white! px-4 py-2 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer hover:opacity-90"
					>
						<Trash2 size={13} />
						<span>Удалить</span>
					</button>
					<button
						onClick={() => setSelectedFileIds([])}
						className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
					>
						Снять выделение
					</button>
				</div>
			</If>

			<If is={isBulkShareOpen}>
				<BulkShareModal
					selectedFiles={files.filter((f) => selectedFileIds.includes(f.id))}
					onClose={() => setIsBulkShareOpen(false)}
					onShare={async (payload) => {
						const res = await bulkShareFiles.mutateAsync(payload);
						setSelectedFileIds([]);
						return res;
					}}
				/>
			</If>
		</div>
	);
};
export default FilesTab;
