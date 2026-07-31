import { useMemo } from "react";
import { IBreadcrumbItem } from "@shared/ui";

interface IParams {
	type: string;
	folderId?: string;
	folders: any[];
	setParams: (key: string, value: any) => void;
}

/** Хлебные крошки реестра: корневой раздел + путь по дереву папок. */
export const useRegistryBreadcrumbs = ({
	type,
	folderId,
	folders,
	setParams,
}: IParams) =>
	useMemo(() => {
		const items: IBreadcrumbItem[] = [];

		const rootLabel =
			type === "internal-incoming"
				? "Входящие"
				: type === "internal-outgoing"
					? "Исходящие"
					: type === "internal-drafts"
						? "Черновики"
						: type === "internal-to-sign"
							? "На подпись"
							: type === "internal-to-approve"
								? "На согласование"
								: "Реестр";

		items.push({
			label: rootLabel,
			onClick: () => {
				setParams("folder_id", undefined);
				setParams("status", undefined);
			},
		});

		if (folderId && folders.length > 0) {
			const path: IBreadcrumbItem[] = [];
			let currentId: number | null = parseInt(folderId, 10);

			while (currentId) {
				const folder = folders.find((f: any) => f.id === currentId);
				if (folder) {
					if (folder.name !== rootLabel) {
						const siblings = folders
							.filter(
								(f: any) =>
									f.parent_id === folder.parent_id && f.id !== folder.id,
							)
							.map((s: any) => ({
								label: s.name,
								onClick: () => setParams("folder_id", String(s.id)),
							}));

						const subfolders = folders
							.filter((f: any) => f.parent_id === folder.id)
							.map((s: any) => ({
								label: s.name,
								onClick: () => setParams("folder_id", String(s.id)),
							}));

						const allOptions: any[] = [];

						if (subfolders.length > 0) {
							allOptions.push({ label: "Вложенные папки", isHeader: true });
							allOptions.push(...subfolders);
						}

						if (siblings.length > 0) {
							if (allOptions.length > 0) allOptions.push({ isDivider: true });
							allOptions.push({ label: "Другие папки", isHeader: true });
							allOptions.push(...siblings);
						}

						path.unshift({
							label: folder.name,
							onClick: () => setParams("folder_id", String(folder.id)),
							options: allOptions.length > 0 ? allOptions : undefined,
						});
					}
					currentId = folder.parent_id;
				} else {
					currentId = null;
				}
			}
			items.push(...path);
		}

		if (items.length > 0) {
			items[items.length - 1].isActive = true;
		}

		return items;
	}, [type, folderId, folders, setParams]);
