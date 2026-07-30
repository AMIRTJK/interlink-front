import type { IApiFile, IFileUser } from "./lib";
import { getUserFullName } from "./lib";

export const SHARE_COLORS = [
	"#6366f1",
	"#8b5cf6",
	"#38bdf8",
	"#10b981",
	"#f59e0b",
	"#ec4899",
];

export const tooltipStyle = {
	borderRadius: "12px",
	border: "none",
	boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
	fontSize: "12px",
} as const;

export interface ISharesPagination {
	total: number;
	currentPage: number;
	perPage: number;
}

export interface ISharedWithMeEntry {
	user: IFileUser;
	name: string;
	value: number;
	fill: string;
}

export interface ISharedFolderEntry {
	folderName: string;
	emoji: string | null;
	count: number;
}

export const buildSharedWithMeData = (
	sharedWithMe: IApiFile[],
): ISharedWithMeEntry[] => {
	const map = new Map<number, { user: IFileUser; count: number }>();
	sharedWithMe.forEach((file) => {
		const user = file.owner;
		if (!user || !user.id) return;
		const existing = map.get(user.id);
		if (existing) {
			existing.count += 1;
		} else {
			map.set(user.id, { user, count: 1 });
		}
	});
	return Array.from(map.values())
		.sort((a, b) => b.count - a.count)
		.slice(0, 6)
		.map((item, index) => ({
			user: item.user,
			name: getUserFullName(item.user),
			value: item.count,
			fill: SHARE_COLORS[index % SHARE_COLORS.length],
		}));
};

export const buildSharedFoldersData = (
	myFiles: IApiFile[],
): ISharedFolderEntry[] => {
	const map = new Map<string, ISharedFolderEntry>();
	myFiles.forEach((file) => {
		if (!file.folder) return;
		const name = file.folder.name;
		const existing = map.get(name);
		if (existing) {
			existing.count += 1;
		} else {
			map.set(name, {
				folderName: name,
				emoji: file.folder.emoji,
				count: 1,
			});
		}
	});
	return Array.from(map.values())
		.sort((a, b) => b.count - a.count)
		.slice(0, 6);
};
