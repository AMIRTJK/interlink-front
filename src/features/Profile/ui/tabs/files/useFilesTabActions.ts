import { useCallback, useState } from "react";
import { toast } from "@shared/lib/toast";
import type { IApiFile, IApiFolder } from "./lib";
import type { TFilesData, TFilesShareItem } from "./filesTabModel";
import {
	confirmBulkDeleteFiles,
	confirmDeleteFile,
	confirmDeleteFolder,
} from "./confirmations";

interface IParams {
	data: TFilesData;
	activeFolderId: number | "all";
	setActiveFolderId: (id: number | "all") => void;
	selectedFileIds: number[];
	clearSelection: () => void;
}

export const useFilesTabActions = ({
	data,
	activeFolderId,
	setActiveFolderId,
	selectedFileIds,
	clearSelection,
}: IParams) => {
	const {
		folders,
		createFolder,
		updateFolder,
		deleteFolder,
		updateFile,
		deleteFile,
		uploadFile,
		reorderFiles,
		bulkDeleteFiles,
	} = data;

	const [previewFile, setPreviewFile] = useState<IApiFile | null>(null);
	const [movingFile, setMovingFile] = useState<IApiFile | null>(null);
	const [folderModalOpen, setFolderModalOpen] = useState(false);
	const [folderModalTitle, setFolderModalTitle] = useState("");
	const [editingFolder, setEditingFolder] = useState<IApiFolder | null>(null);
	const [addCategoryOpen, setAddCategoryOpen] = useState(false);
	const [shareItem, setShareItem] = useState<TFilesShareItem | null>(null);
	const [isBulkShareOpen, setIsBulkShareOpen] = useState(false);

	const handleUpload = useCallback(
		(file: File) => {
			const formData = new FormData();
			formData.append("files[]", file);
			if (typeof activeFolderId === "number") {
				formData.append("folder_id", String(activeFolderId));
			}
			uploadFile.mutate(formData);
		},
		[activeFolderId, uploadFile],
	);

	const handleCreateFolderSubmit = useCallback(
		(name: string, emoji: string | null) => {
			if (editingFolder) {
				updateFolder.mutate({
					id: editingFolder.id,
					name,
					parent_id: editingFolder.parent_id,
					...(emoji !== undefined ? { emoji } : {}),
				});
			}
			setEditingFolder(null);
		},
		[editingFolder, updateFolder],
	);

	const handleAddCategorySubmit = useCallback(
		(payload: {
			name: string;
			icon?: string;
			allowed_user_ids?: number[];
		}) => {
			createFolder.mutate({
				name: payload.name,
				parent_id: null,
				...(payload.icon ? { icon: payload.icon } : {}),
				...(payload.allowed_user_ids
					? { allowed_user_ids: payload.allowed_user_ids }
					: {}),
			} as any);
		},
		[createFolder],
	);

	const handleOpenRenameFolder = useCallback(
		(folderName: string, id: number) => {
			const folder = folders.find((f) => Number(f.id) === Number(id));
			if (folder) {
				setEditingFolder(folder);
				setFolderModalTitle("Переименовать папку");
				setFolderModalOpen(true);
			}
		},
		[folders],
	);

	const handleDeleteFolderConfirm = useCallback(
		(id: number) => {
			confirmDeleteFolder(() => {
				deleteFolder.mutate({ id });
				setActiveFolderId("all");
			});
		},
		[deleteFolder, setActiveFolderId],
	);

	const handleTogglePin = useCallback(
		(file: IApiFile) => {
			updateFile.mutate({ id: file.id, is_starred: !file.is_starred });
		},
		[updateFile],
	);

	const handleDeleteFileConfirm = useCallback(
		(id: number) => {
			confirmDeleteFile(() => deleteFile.mutate({ id }));
		},
		[deleteFile],
	);

	const handleBulkDeleteConfirm = useCallback(() => {
		confirmBulkDeleteFiles(selectedFileIds.length, async () => {
			try {
				const res = await bulkDeleteFiles.mutateAsync({
					file_ids: selectedFileIds,
				});
				toast.success(
					`Успешно удалено файлов: ${res.data.deleted_files_count}`,
				);
				if (res.data.storage_cleanup_failed) {
					toast.warning(
						"Часть файлов не удалось очистить из хранилища. Обратитесь к администратору.",
					);
				}
				clearSelection();
			} catch (err) {
				console.error(err);
			}
		});
	}, [selectedFileIds, bulkDeleteFiles, clearSelection]);

	const handleMoveFileConfirm = useCallback(
		(targetFolderId: number | null) => {
			if (movingFile) {
				updateFile.mutate({ id: movingFile.id, folder_id: targetFolderId });
				setMovingFile(null);
			}
		},
		[movingFile, updateFile],
	);

	const handleReorderFiles = useCallback(
		(fileIds: number[]) => {
			reorderFiles.mutate({
				folder_id: typeof activeFolderId === "number" ? activeFolderId : null,
				file_ids: fileIds,
			});
		},
		[activeFolderId, reorderFiles],
	);

	return {
		previewFile,
		setPreviewFile,
		movingFile,
		setMovingFile,
		folderModalOpen,
		setFolderModalOpen,
		folderModalTitle,
		editingFolder,
		setEditingFolder,
		addCategoryOpen,
		setAddCategoryOpen,
		shareItem,
		setShareItem,
		isBulkShareOpen,
		setIsBulkShareOpen,
		handleUpload,
		handleCreateFolderSubmit,
		handleAddCategorySubmit,
		handleOpenRenameFolder,
		handleDeleteFolderConfirm,
		handleTogglePin,
		handleDeleteFileConfirm,
		handleBulkDeleteConfirm,
		handleMoveFileConfirm,
		handleReorderFiles,
	};
};

export type TFilesTabActions = ReturnType<typeof useFilesTabActions>;
