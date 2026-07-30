import type { TFilesSort } from "./filesTabModel";

export const SORT_OPTIONS: TFilesSort[] = ["manual", "date", "size", "name"];

export const SORT_LABELS: Record<TFilesSort, string> = {
	manual: "Ручная",
	date: "Дата",
	size: "Размер",
	name: "Имя",
};
