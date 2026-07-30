import type { IApiFile } from "./lib";

export const COUNT_FETCH_SIZE = 100;

export interface IFilesParams {
	search?: string;
	sort?: "name" | "date" | "size" | "manual";
	dir?: "asc" | "desc";
	activeFolderId?: number | "all";
	page?: number;
}

export interface IFilesPaginatedData {
	current_page: number;
	data: IApiFile[];
	last_page: number;
	per_page: number;
	total: number;
}

export interface IFilesCategory {
	id: number | "all";
	name: string;
	icon: string;
	count: number;
}
