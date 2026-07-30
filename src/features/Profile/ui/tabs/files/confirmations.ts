import { Modal } from "antd";

const dangerOkButtonProps = {
	danger: true,
	className: "bg-red-600! hover:bg-red-700!",
};

export const confirmDeleteFolder = (onOk: () => void) => {
	Modal.confirm({
		title: "Удалить папку?",
		content:
			"Папка и всё её содержимое будут удалены: вложенные папки любого уровня, все файлы внутри них и предоставленные доступы. Действие необратимо.",
		okText: "Удалить",
		okButtonProps: dangerOkButtonProps,
		cancelText: "Отмена",
		onOk,
	});
};

export const confirmDeleteFile = (onOk: () => void) => {
	Modal.confirm({
		title: "Удалить файл?",
		content: "Вы действительно хотите удалить этот файл?",
		okText: "Удалить",
		okButtonProps: dangerOkButtonProps,
		cancelText: "Отмена",
		onOk,
	});
};

export const confirmBulkDeleteFiles = (
	selectedCount: number,
	onOk: () => Promise<void>,
) => {
	Modal.confirm({
		title: "Удалить выбранные файлы?",
		content: `Вы действительно хотите удалить выбранные файлы (${selectedCount} шт.)? Действие необратимо.`,
		okText: "Удалить",
		okButtonProps: dangerOkButtonProps,
		cancelText: "Отмена",
		onOk,
	});
};
