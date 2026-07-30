import type { IApiFile, IApiFolder } from "./lib";
import type { useFilesData } from "./useFilesData";

export type TFilesViewContext = "personal" | "shared" | "analytics";

export type TFilesSort = "date" | "size" | "name" | "manual";

export type TFilesSortDir = "asc" | "desc";

export type TFilesViewMode = "grid" | "list";

export type TFilesShareItem = {
	item: IApiFile | IApiFolder;
	type: "file" | "folder";
};

export type TFilesData = ReturnType<typeof useFilesData>;
