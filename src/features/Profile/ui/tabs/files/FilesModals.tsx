import { Suspense } from "react";
import { If } from "@shared/ui";
import { BulkActionsBar } from "./BulkActionsBar";
import {
	AddCategoryModal,
	BulkShareModal,
	FilePreviewModal,
	FolderActionsModal,
	MoveToFolderModal,
	ShareFileModal,
} from "./lazyModals";
import type { TFilesData, TFilesViewContext } from "./filesTabModel";
import type { TFilesSelection } from "./useFilesSelection";
import type { TFilesTabActions } from "./useFilesTabActions";

interface IProps {
	data: TFilesData;
	actions: TFilesTabActions;
	selection: TFilesSelection;
	viewContext: TFilesViewContext;
}

export const FilesModals = ({
	data,
	actions,
	selection,
	viewContext,
}: IProps) => {
	const {
		files,
		folders,
		createFolder,
		updateFolder,
		inviteToFile,
		removeFileShare,
		inviteToFolder,
		removeFolderShare,
		bulkShareFiles,
	} = data;

	const { shareItem } = actions;

	return (
		<Suspense fallback={null}>
			<AddCategoryModal
				isOpen={actions.addCategoryOpen}
				onClose={() => actions.setAddCategoryOpen(false)}
				onSubmit={(payload) => {
					createFolder.mutateAsync({
						...payload,
						parent_id: null,
					});
					actions.setAddCategoryOpen(false);
				}}
			/>

			<FolderActionsModal
				isOpen={actions.folderModalOpen}
				onClose={() => {
					actions.setFolderModalOpen(false);
					actions.setEditingFolder(null);
				}}
				initialName={actions.editingFolder?.name || ""}
				initialEmoji={actions.editingFolder?.emoji || null}
				title={actions.folderModalTitle}
				onSubmit={async (name, emoji) => {
					if (actions.editingFolder) {
						await updateFolder.mutateAsync({
							id: actions.editingFolder.id,
							name,
							emoji,
							parent_id: null,
						});
					}
					actions.setFolderModalOpen(false);
				}}
			/>

			<MoveToFolderModal
				isOpen={!!actions.movingFile}
				onClose={() => actions.setMovingFile(null)}
				folders={folders}
				currentFolderId={actions.movingFile?.folder_id || null}
				onConfirm={actions.handleMoveFileConfirm}
				fileName={actions.movingFile?.original_name || ""}
			/>

			<FilePreviewModal
				file={actions.previewFile}
				onClose={() => actions.setPreviewFile(null)}
			/>

			{shareItem && (
				<ShareFileModal
					item={shareItem.item}
					type={shareItem.type}
					onClose={() => actions.setShareItem(null)}
					onInvite={(userId) => {
						if (shareItem.type === "file") {
							return inviteToFile.mutateAsync({
								id: shareItem.item.id,
								user_id: userId,
							});
						} else {
							return inviteToFolder.mutateAsync({
								id: shareItem.item.id,
								user_id: userId,
							});
						}
					}}
					onRemoveShare={(shareId) => {
						if (shareItem.type === "file") {
							return removeFileShare.mutateAsync({
								id: shareItem.item.id,
								shareId,
							});
						} else {
							return removeFolderShare.mutateAsync({
								id: shareItem.item.id,
								shareId,
							});
						}
					}}
				/>
			)}

			<If
				is={
					selection.selectedFileIds.length > 0 && viewContext === "personal"
				}
			>
				<BulkActionsBar
					selectedCount={selection.selectedFileIds.length}
					onShare={() => actions.setIsBulkShareOpen(true)}
					onDelete={actions.handleBulkDeleteConfirm}
					onClear={selection.clear}
				/>
			</If>

			<If is={actions.isBulkShareOpen}>
				<BulkShareModal
					selectedFiles={files.filter((f) =>
						selection.selectedFileIds.includes(f.id),
					)}
					onClose={() => actions.setIsBulkShareOpen(false)}
					onShare={async (payload) => {
						const res = await bulkShareFiles.mutateAsync(payload);
						selection.clear();
						return res;
					}}
				/>
			</If>
		</Suspense>
	);
};
