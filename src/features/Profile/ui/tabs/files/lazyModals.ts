import { lazy } from "react";

export const FilePreviewModal = lazy(() =>
	import("./FilePreviewModal").then((m) => ({
		default: m.FilePreviewModal,
	})),
);

export const FolderActionsModal = lazy(() =>
	import("./FolderActionsModal").then((m) => ({
		default: m.FolderActionsModal,
	})),
);

export const AddCategoryModal = lazy(() =>
	import("./AddCategoryModal").then((m) => ({
		default: m.AddCategoryModal,
	})),
);

export const MoveToFolderModal = lazy(() =>
	import("./MoveToFolderModal").then((m) => ({
		default: m.MoveToFolderModal,
	})),
);

export const BulkShareModal = lazy(() =>
	import("./BulkShareModal").then((m) => ({
		default: m.BulkShareModal,
	})),
);

export const ShareFileModal = lazy(() =>
	import("./ShareFileModal").then((m) => ({
		default: m.ShareFileModal,
	})),
);

export const FilesAnalytics = lazy(() =>
	import("./FilesAnalytics").then((m) => ({
		default: m.FilesAnalytics,
	})),
);
