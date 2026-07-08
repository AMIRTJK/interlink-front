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
import { ShareFileModal } from "./files/ShareFileModal";
import { IApiFile, IApiFolder } from "./files/lib";
import { Modal } from "antd";
import { Upload, ChevronRight, Folder } from "lucide-react";
import { If } from "@shared/ui";
import "./FilesTab.css";

export const FilesTab = () => {
	const [activeFolderId, setActiveFolderId] = useState<number | "all">("all");
	const [viewContext, setViewContext] = useState<"personal" | "shared">("personal");
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
	const [addCategoryOpen, setAddCategoryOpen] = useState(false);
	const [shareItem, setShareItem] = useState<{ item: IApiFile | IApiFolder; type: "file" | "folder" } | null>(null);

	// Queries & Mutations
	const {
		files,
		folders,
		meta,
		isLoadingFiles,
		categoriesList,
		sharedCategoriesList,
		activeCategoryId,
		pinnedFiles,
		currentFiles: personalCurrentFiles,
		currentFolders: personalCurrentFolders,
		breadcrumbs,
		showBreadcrumbs,
		sharedFiles,
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
	} = useFilesData({
		search: searchQuery,
		sort: sortBy,
		dir: sortDir,
		activeFolderId,
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
			parent_id: typeof activeFolderId === "number" ? activeFolderId : null,
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
				"Внимание! Все вложенные файлы и подпапки будут удалены безвозвратно. Вы действительно хотите удалить эту папку?",
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
				totalCount={currentFiles.length}
				onCreateFolderClick={() => setAddCategoryOpen(true)}
				viewContext={viewContext}
				onViewContextChange={(ctx) => {
					setViewContext(ctx);
					setActiveFolderId("all");
				}}
			/>

			{/* Category/Folder Filters */}
			<CategoryFilters
				categories={viewContext === "shared" ? sharedCategoriesList : categoriesList}
				activeCategory={activeCategoryId}
				onCategorySelect={(id) => setActiveFolderId(id)}
				onAddCategoryClick={() => setAddCategoryOpen(true)}
				onRenameCategory={viewContext === "personal" ? (cat) => handleOpenRenameFolder(cat.name, Number(cat.id)) : undefined}
				onDeleteCategory={viewContext === "personal" ? handleDeleteFolderConfirm : undefined}
				onShareCategory={viewContext === "personal" ? (cat) => {
					const folder = folders.find((f) => f.id === Number(cat.id));
					if (folder) setShareItem({ item: folder, type: "folder" });
				} : undefined}
			/>

			{/* Breadcrumbs */}
			<If is={showBreadcrumbs}>
				<div className="flex flex-wrap items-center text-xs font-semibold text-slate-500 dark:text-zinc-400 py-1.5 border-b border-slate-100/50 dark:border-slate-800/50">
					{breadcrumbs.map((crumb, idx) => {
						const isLast = idx === breadcrumbs.length - 1;
						return (
							<React.Fragment key={crumb.id}>
								<If is={idx > 0}>
									<span className="text-slate-300 dark:text-zinc-700 mx-1.5">/</span>
								</If>
								<span
									onClick={() => !isLast && setActiveFolderId(crumb.id)}
									className={`transition-all ${
										isLast
											? "text-slate-700 dark:text-zinc-200 font-bold"
											: "cursor-pointer hover:text-indigo-650 hover:underline"
									}`}
								>
									{crumb.name}
								</span>
							</React.Fragment>
						);
					})}
					{currentFolders.length > 0 && currentFolders.map((child) => (
						<React.Fragment key={child.id}>
							<span className="text-slate-300 dark:text-zinc-700 mx-1.5">/</span>
							<span
								onClick={() => setActiveFolderId(child.id)}
								className="cursor-pointer hover:text-indigo-655 hover:underline text-slate-500 dark:text-zinc-400 transition-all font-semibold"
							>
								{child.name}
							</span>
						</React.Fragment>
					))}
				</div>
			</If>

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
							? "border-indigo-600 bg-indigo-50/30 text-indigo-650"
							: "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-355 dark:hover:border-slate-700"
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
					/>
				</div>
			)}

			{/* Storage usage details */}
			<If is={viewContext === "personal"}>
				<StorageUsage meta={meta} files={files} />
			</If>

			{/* Modals */}
			<AddCategoryModal
				isOpen={addCategoryOpen}
				onClose={() => setAddCategoryOpen(false)}
				onSubmit={(payload) => {
					createFolder.mutateAsync({
						...payload,
						parent_id: activeFolderId === "all" ? null : activeFolderId,
					});
					setAddCategoryOpen(false);
				}}
			/>

			<FolderActionsModal
				open={folderModalOpen}
				onClose={() => {
					setFolderModalOpen(false);
					setEditingFolder(null);
				}}
				initialName={editingFolder?.name || ""}
				initialEmoji={editingFolder?.emoji || null}
				title={folderModalTitle}
				onSave={async (name, emoji) => {
					if (editingFolder) {
						await updateFolder.mutateAsync({
							id: editingFolder.id,
							name,
							emoji,
							parent_id: editingFolder.parent_id,
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
		</div>
	);
};
export default FilesTab;
