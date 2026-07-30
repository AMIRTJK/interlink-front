import { useMemo } from "react";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { IApiFile, IApiFolder, IDiskMeta } from "./lib";
import {
	COUNT_FETCH_SIZE,
	IFilesPaginatedData,
	IFilesParams,
} from "./filesDataModel";

export const useFilesQueries = (params: IFilesParams) => {
	const memoizedParams = useMemo(
		() => ({
			search: params.search ?? "",
			sort: params.sort ?? "manual",
			dir: params.dir ?? "desc",
			activeFolderId: params.activeFolderId ?? "all",
			page: params.page ?? 1,
		}),
		[params.search, params.sort, params.dir, params.activeFolderId, params.page],
	);

	const countParams = useMemo(() => ({ per_page: COUNT_FETCH_SIZE }), []);

	const personalFilesParams = useMemo(() => {
		const { activeFolderId: personalFolderId, ...baseParams } = memoizedParams;
		return {
			...baseParams,
			...(typeof personalFolderId === "number" ? { folder_id: personalFolderId } : {}),
		};
	}, [memoizedParams]);

	const sharedFilesParams = useMemo(() => {
		const { activeFolderId: sharedFolderId, ...sharedBaseParams } = memoizedParams;
		return {
			...sharedBaseParams,
			...(typeof sharedFolderId === "number" ? { folder_id: sharedFolderId } : {}),
		};
	}, [memoizedParams]);

	const cacheOptions = useMemo(
		() => ({
			staleTime: 1000 * 60 * 5,
			refetchOnWindowFocus: false,
		}),
		[],
	);

	const filesQuery = useGetQuery<typeof personalFilesParams, { success: boolean; data: IFilesPaginatedData }>({
		url: ApiRoutes.MY_FILES,
		params: personalFilesParams,
		useToken: true,
		options: cacheOptions,
	});

	const foldersQuery = useGetQuery<any, { success: boolean; data: IApiFolder[] }>({
		url: ApiRoutes.MY_FILE_FOLDERS,
		useToken: true,
		options: cacheOptions,
	});

	const metaQuery = useGetQuery<any, { success: boolean; data: IDiskMeta }>({
		url: ApiRoutes.MY_FILES_META,
		useToken: true,
		options: cacheOptions,
	});

	const filesCountQuery = useGetQuery<{ per_page: number }, { success: boolean; data: IFilesPaginatedData }>({
		url: ApiRoutes.MY_FILES,
		params: countParams,
		useToken: true,
		options: cacheOptions,
	});

	const sharedFilesQuery = useGetQuery<typeof sharedFilesParams, { success: boolean; data: { data: IApiFile[]; current_page?: number; total?: number; per_page?: number } }>({
		url: ApiRoutes.MY_FILES_SHARED_WITH_ME,
		params: sharedFilesParams,
		useToken: true,
		options: cacheOptions,
	});

	const sharedFoldersQuery = useGetQuery<any, { success: boolean; data: IApiFolder[] }>({
		url: ApiRoutes.MY_FILE_FOLDERS_SHARED_WITH_ME,
		useToken: true,
		options: cacheOptions,
	});

	const sharedFilesCountQuery = useGetQuery<{ per_page: number }, { success: boolean; data: { data: IApiFile[]; total?: number } }>({
		url: ApiRoutes.MY_FILES_SHARED_WITH_ME,
		params: countParams,
		useToken: true,
		options: cacheOptions,
	});

	return {
		filesQuery,
		foldersQuery,
		metaQuery,
		filesCountQuery,
		sharedFilesQuery,
		sharedFoldersQuery,
		sharedFilesCountQuery,
	};
};
