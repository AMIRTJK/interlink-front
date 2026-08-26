import { useMemo, useState, Suspense } from "react";
import { useFilesData } from "./files/useFilesData";
import { FilesHeader } from "./files/FilesHeader";
import { CategoryFilters } from "./files/CategoryFilters";
import { PinnedFiles } from "./files/PinnedFiles";
import { FileGridList } from "./files/FileGridList";
import { StorageUsage } from "./files/StorageUsage";
import { FilesDropzone } from "./files/FilesDropzone";
import { FilesEmptyState, FilesLoadingState } from "./files/FilesStates";
import { FilesModals } from "./files/FilesModals";
import { FilesAnalytics } from "./files/lazyModals";
import { useFilesSelection } from "./files/useFilesSelection";
import { useFilesTabActions } from "./files/useFilesTabActions";
import {
	PROFILE_FILES_VIEW_MODE_STORAGE_KEY,
	type TFilesSort,
	type TFilesSortDir,
	type TFilesViewContext,
	type TFilesViewMode,
} from "./files/filesTabModel";
import { If } from "@shared/ui";
import "./FilesTab.css";

export const FilesTab = () => {
	const [activeFolderId, setActiveFolderId] = useState<number | "all">("all");
	const [viewContext, setViewContext] = useState<TFilesViewContext>("personal");
	const [searchQuery, setSearchQuery] = useState("");
	const [sortBy, setSortBy] = useState<TFilesSort>("manual");
	const [sortDir, setSortDir] = useState<TFilesSortDir>("desc");
	const [viewMode, setViewMode] = useState<TFilesViewMode>(() => {
		try {
			const saved = localStorage.getItem(PROFILE_FILES_VIEW_MODE_STORAGE_KEY);
			if (saved === "grid" || saved === "list") return saved;
		} catch {}
		return "grid";
	});
	const [filesPage, setFilesPage] = useState(1);

	const handleViewModeChange = (mode: TFilesViewMode) => {
		setViewMode(mode);
		try {
			localStorage.setItem(PROFILE_FILES_VIEW_MODE_STORAGE_KEY, mode);
		} catch {}
	};

	const filesParams = useMemo(
		() => ({
			search: searchQuery,
			sort: sortBy,
			dir: sortDir,
			activeFolderId,
			page: filesPage,
		}),
		[searchQuery, sortBy, sortDir, activeFolderId, filesPage],
	);

	const data = useFilesData(filesParams);

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
		sharedFolders,
		isLoadingSharedFiles,
	} = data;

	const currentFiles =
		viewContext === "shared" ? sharedFiles : personalCurrentFiles;
	const currentFolders =
		viewContext === "shared" ? sharedFolders : personalCurrentFolders;
	const isLoadingCurrent =
		viewContext === "shared" ? isLoadingSharedFiles : isLoadingFiles;

	const selection = useFilesSelection(currentFiles);

	const actions = useFilesTabActions({
		data,
		activeFolderId,
		setActiveFolderId,
		selectedFileIds: selection.selectedFileIds,
		clearSelection: selection.clear,
	});

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
				onViewModeChange={handleViewModeChange}
				onUpload={actions.handleUpload}
				personalCount={folders.length}
				sharedCount={sharedFolders.length}
				onCreateFolderClick={() => actions.setAddCategoryOpen(true)}
				viewContext={viewContext}
				onViewContextChange={(ctx) => {
					setViewContext(ctx);
					setActiveFolderId("all");
					setFilesPage(1);
					selection.clear();
				}}
			/>

			<If is={viewContext === "analytics"}>
				<Suspense fallback={null}>
					<FilesAnalytics />
				</Suspense>
			</If>

			<If is={viewContext !== "analytics"}>
				<div className="space-y-6">
					{/* Category/Folder Filters */}
					<CategoryFilters
						categories={
							viewContext === "shared" ? sharedCategoriesList : categoriesList
						}
						activeCategory={activeCategoryId}
						onCategorySelect={(id) => {
							setActiveFolderId(id);
							setFilesPage(1);
							selection.clear();
						}}
						onAddCategoryClick={
							viewContext === "personal"
								? () => actions.setAddCategoryOpen(true)
								: undefined
						}
						onRenameCategory={
							viewContext === "personal"
								? (cat) =>
										actions.handleOpenRenameFolder(cat.name, Number(cat.id))
								: undefined
						}
						onDeleteCategory={
							viewContext === "personal"
								? actions.handleDeleteFolderConfirm
								: undefined
						}
						onShareCategory={
							viewContext === "personal"
								? (cat) => {
										const folder = folders.find(
											(f) => f.id === Number(cat.id),
										);
										if (folder)
											actions.setShareItem({ item: folder, type: "folder" });
									}
								: undefined
						}
					/>

					{/* Starred/Pinned Files */}
					<If is={viewContext === "personal"}>
						<PinnedFiles
							pinnedFiles={pinnedFiles}
							onUnpin={actions.handleTogglePin}
						/>
					</If>

					{/* Drag & Drop Zone */}
					<If is={viewContext === "personal"}>
						<FilesDropzone onUpload={actions.handleUpload} />
					</If>

					{/* Files & Subfolders Display */}
					{isLoadingCurrent ? (
						<FilesLoadingState />
					) : currentFiles.length === 0 && currentFolders.length === 0 ? (
						<FilesEmptyState viewContext={viewContext} />
					) : (
						<div className="space-y-8 animate-in fade-in duration-200">
							{/* Files View */}
							<FileGridList
								files={currentFiles}
								viewMode={viewMode}
								selectedFileIds={selection.selectedFileIds}
								onToggleSelectFile={selection.toggle}
								onView={actions.setPreviewFile}
								onTogglePin={
									viewContext === "personal"
										? actions.handleTogglePin
										: undefined
								}
								onDelete={
									viewContext === "personal"
										? actions.handleDeleteFileConfirm
										: undefined
								}
								onMove={
									viewContext === "personal" ? actions.setMovingFile : undefined
								}
								onShare={
									viewContext === "personal"
										? (file) =>
												actions.setShareItem({ item: file, type: "file" })
										: undefined
								}
								showSharedWith={viewContext === "personal"}
								pagination={filesPagination}
								onPageChange={setFilesPage}
								onSelectAll={selection.selectAll}
								onDeselectAll={selection.deselectAll}
								onReorderFiles={
									viewContext === "personal"
										? actions.handleReorderFiles
										: undefined
								}
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
			<FilesModals
				data={data}
				actions={actions}
				selection={selection}
				viewContext={viewContext}
			/>
		</div>
	);
};
export default FilesTab;
