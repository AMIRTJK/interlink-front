import { useMemo, useState } from "react";
import { IApiFile } from "./lib";
import { IFilesParams } from "./filesDataModel";
import {
	buildCategoriesList,
	buildFolderFileCounts,
	getArrayData,
	sortByManualOrder,
} from "./filesDataLib";
import { useFilesQueries } from "./useFilesQueries";
import { useFilesMutations } from "./useFilesMutations";

export const useFilesData = (params: IFilesParams) => {
	const [manualOrderMap, setManualOrderMap] = useState<Record<number, number>>({});
	const mutations = useFilesMutations(setManualOrderMap);

	const {
		filesQuery,
		foldersQuery,
		metaQuery,
		filesCountQuery,
		sharedFilesQuery,
		sharedFoldersQuery,
		sharedFilesCountQuery,
	} = useFilesQueries(params);

	const folders = getArrayData(foldersQuery.data?.data);
	const rawFilesData = filesQuery.data?.data;
	const files: IApiFile[] = Array.isArray(rawFilesData)
		? rawFilesData
		: rawFilesData?.data ?? [];

	const filesPagination = {
		total: rawFilesData?.total ?? 0,
		currentPage: rawFilesData?.current_page ?? 1,
		perPage: rawFilesData?.per_page ?? 30,
	};

	const rawSharedFilesData = sharedFilesQuery.data?.data;
	const sharedFiles = useMemo(
		() =>
			sortByManualOrder(
				getArrayData(rawSharedFilesData),
				manualOrderMap,
				params.sort,
			),
		[rawSharedFilesData, params.sort, params.dir, manualOrderMap],
	);
	const sharedFolders = getArrayData(sharedFoldersQuery.data?.data);

	const sharedFilesPagination = {
		total: rawSharedFilesData?.total ?? 0,
		currentPage: rawSharedFilesData?.current_page ?? 1,
		perPage: rawSharedFilesData?.per_page ?? 30,
	};

	const allFilesList = useMemo(
		() => getArrayData(filesCountQuery.data?.data),
		[filesCountQuery.data],
	);
	const folderFileCounts = useMemo(
		() => buildFolderFileCounts(allFilesList),
		[allFilesList],
	);

	const calculatedTotalFromFolders = useMemo(() => {
		const foldersCount = folders.reduce((sum, f) => {
			const cnt = f.files_count ?? folderFileCounts[f.id] ?? 0;
			return sum + cnt;
		}, 0);
		const rootCount = allFilesList.filter((f) => f.folder_id === null).length;
		return foldersCount + rootCount;
	}, [folders, folderFileCounts, allFilesList]);

	const allFilesCount = useMemo(() => {
		const backendTotal = filesCountQuery.data?.data?.total;
		const metaTotal = metaQuery.data?.data?.total_count;
		return Math.max(
			backendTotal ?? 0,
			metaTotal ?? 0,
			allFilesList.length,
			files.length,
			calculatedTotalFromFolders,
		);
	}, [
		filesCountQuery.data,
		metaQuery.data,
		allFilesList,
		files,
		calculatedTotalFromFolders,
	]);

	const allSharedFilesList = useMemo(
		() => getArrayData(sharedFilesCountQuery.data?.data),
		[sharedFilesCountQuery.data],
	);
	const sharedFolderFileCounts = useMemo(
		() => buildFolderFileCounts(allSharedFilesList),
		[allSharedFilesList],
	);

	const calculatedSharedTotalFromFolders = useMemo(() => {
		const foldersCount = sharedFolders.reduce((sum, f) => {
			const cnt = f.files_count ?? sharedFolderFileCounts[f.id] ?? 0;
			return sum + cnt;
		}, 0);
		const rootCount = allSharedFilesList.filter(
			(f) => f.folder_id === null,
		).length;
		return foldersCount + rootCount;
	}, [sharedFolders, sharedFolderFileCounts, allSharedFilesList]);

	const allSharedFilesCount = useMemo(() => {
		const backendTotal = sharedFilesCountQuery.data?.data?.total;
		return Math.max(
			backendTotal ?? 0,
			allSharedFilesList.length,
			sharedFiles.length,
			calculatedSharedTotalFromFolders,
		);
	}, [
		sharedFilesCountQuery.data,
		allSharedFilesList,
		sharedFiles,
		calculatedSharedTotalFromFolders,
	]);

	const categoriesList = useMemo(
		() =>
			buildCategoriesList(
				{ name: "Все файлы", icon: "📁", count: allFilesCount },
				folders,
				folderFileCounts,
			),
		[folders, allFilesCount, folderFileCounts],
	);

	const sharedCategoriesList = useMemo(
		() =>
			buildCategoriesList(
				{ name: "Все общие файлы", icon: "🤝", count: allSharedFilesCount },
				sharedFolders,
				sharedFolderFileCounts,
			),
		[sharedFolders, allSharedFilesCount, sharedFolderFileCounts],
	);

	const activeCategoryId = useMemo((): number | "all" => {
		const actId = params.activeFolderId;
		if (actId === undefined || actId === "all") return "all";
		return actId;
	}, [params.activeFolderId]);

	const pinnedFiles = useMemo(() => {
		return sortByManualOrder(
			files.filter((f) => f.is_starred),
			manualOrderMap,
			params.sort,
		);
	}, [files, params.sort, params.dir, manualOrderMap]);

	const currentFiles = useMemo(() => {
		const actId = params.activeFolderId;
		if (actId === undefined || actId === "all") {
			return sortByManualOrder(files, manualOrderMap, params.sort);
		}
		const filtered = files.filter(
			(f) => f.folder_id !== null && Number(f.folder_id) === Number(actId),
		);
		return sortByManualOrder(filtered, manualOrderMap, params.sort);
	}, [files, params.activeFolderId, params.sort, params.dir, manualOrderMap]);

	const currentFolders = useMemo(() => {
		const actId = params.activeFolderId;
		const parentId = actId === undefined || actId === "all" ? null : actId;
		if (parentId === null) return [];
		return folders.filter(
			(f) => f.parent_id !== null && Number(f.parent_id) === Number(parentId),
		);
	}, [folders, params.activeFolderId]);

	return {
		files,
		filesPagination,
		isLoadingFiles: filesQuery.isLoading,
		refetchFiles: filesQuery.refetch,

		folders,
		isLoadingFolders: foldersQuery.isLoading,
		refetchFolders: foldersQuery.refetch,

		meta: metaQuery.data?.data || null,
		isLoadingMeta: metaQuery.isLoading,
		refetchMeta: metaQuery.refetch,

		categoriesList,
		sharedCategoriesList,
		activeCategoryId,
		pinnedFiles,
		currentFiles,
		currentFolders,

		sharedFiles,
		sharedFilesPagination,
		isLoadingSharedFiles: sharedFilesQuery.isLoading,
		refetchSharedFiles: sharedFilesQuery.refetch,

		sharedFolders,
		isLoadingSharedFolders: sharedFoldersQuery.isLoading,
		refetchSharedFolders: sharedFoldersQuery.refetch,

		...mutations,
	};
};
