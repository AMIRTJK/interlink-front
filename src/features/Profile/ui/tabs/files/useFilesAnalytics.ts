import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import {
	IFilesAnalyticsData,
	IRawFilesAnalyticsResponse,
	IRawFilesAnalyticsData,
	IRawFilesAnalyticsSummary,
	IRawFilesAnalyticsStorage,
	IRawFilesTypeBreakdownItem,
	IRawFilesFolderBreakdown,
	IRawFilesUploadActivityItem,
	IFilesFolderBreakdownItem,
	IFilesTypeBreakdownItem,
	IFilesUploadActivityItem,
} from "./analyticsModel";

interface IParams {
	months: number;
	limit: number;
}

const normalizeSummary = (summary?: any) => ({
	files_count: summary?.total_files ?? summary?.files_count ?? 0,
	folders_count: summary?.total_folders ?? summary?.folders_count ?? 0,
	starred_count: summary?.starred_files ?? summary?.starred_count ?? 0,
	shared_count: summary?.shared_files ?? summary?.shared_count ?? 0,
});

const normalizeStorage = (storage?: any) => {
	const used = storage?.used_bytes ?? 0;
	const limit = storage?.limit_bytes ?? storage?.total_bytes ?? 0;
	const free = storage?.free_bytes ?? Math.max(0, limit - used);
	const pct =
		storage?.usage_pct ??
		storage?.used_pct ??
		(limit > 0 ? Math.round((used / limit) * 100) : 0);

	return {
		used_bytes: used,
		free_bytes: free,
		total_bytes: limit,
		used_pct: pct,
		used_bytes_human: storage?.used_human || storage?.used_bytes_human,
		free_bytes_human: storage?.free_human || storage?.free_bytes_human,
		total_bytes_human: storage?.limit_human || storage?.total_bytes_human,
	};
};

const normalizeTypeBreakdown = (
	items?: any[],
): IFilesTypeBreakdownItem[] =>
	Array.isArray(items)
		? items.map((item) => ({
				type: item.type || "Неизвестно",
				count: item.file_count ?? item.count ?? 0,
				total_size: item.total_size ?? 0,
				total_size_human: item.total_size_human,
				percentage: item.percentage ?? 0,
		  }))
		: [];

const normalizeFolderBreakdown = (
	breakdown?: any,
): IFilesFolderBreakdownItem[] => {
	if (!breakdown) return [];

	const folders: IFilesFolderBreakdownItem[] = Array.isArray(breakdown.folders)
		? breakdown.folders.map((folder: any) => ({
				folder_id: folder.id ?? folder.folder_id ?? null,
				folder_name: folder.name ?? folder.folder_name ?? "Папка",
				emoji: folder.emoji ?? null,
				files_count: folder.file_count ?? folder.files_count ?? 0,
				total_size: folder.total_size ?? 0,
				total_size_human: folder.total_size_human,
		  }))
		: Array.isArray(breakdown)
		? breakdown.map((folder: any) => ({
				folder_id: folder.id ?? folder.folder_id ?? null,
				folder_name: folder.name ?? folder.folder_name ?? "Папка",
				emoji: folder.emoji ?? null,
				files_count: folder.file_count ?? folder.files_count ?? 0,
				total_size: folder.total_size ?? 0,
				total_size_human: folder.total_size_human,
		  }))
		: [];

	if (breakdown.without_folder) {
		folders.push({
			folder_id: null,
			folder_name: "Без папки",
			emoji: null,
			files_count:
				breakdown.without_folder.file_count ??
				breakdown.without_folder.files_count ??
				0,
			total_size: breakdown.without_folder.total_size ?? 0,
			total_size_human: breakdown.without_folder.total_size_human,
		});
	}

	return folders;
};

const normalizeUploadActivity = (
	items?: any[],
): IFilesUploadActivityItem[] =>
	Array.isArray(items)
		? items.map((item) => ({
				month: item.period || item.month || "",
				count: item.file_count ?? item.count ?? 0,
				total_size: item.total_size ?? 0,
				total_size_human: item.total_size_human,
		  }))
		: [];

const normalizeAnalyticsData = (
	raw?: any,
): IFilesAnalyticsData => ({
	summary: normalizeSummary(raw?.summary),
	storage: normalizeStorage(raw?.storage),
	type_breakdown: normalizeTypeBreakdown(raw?.type_breakdown),
	folder_breakdown: normalizeFolderBreakdown(raw?.folder_breakdown),
	upload_activity: normalizeUploadActivity(raw?.upload_activity),
	recent_files: Array.isArray(raw?.recent_files) ? raw.recent_files : [],
	largest_files: Array.isArray(raw?.largest_files) ? raw.largest_files : [],
});

export const useFilesAnalytics = (params: IParams) => {
	const query = useGetQuery<IParams, IRawFilesAnalyticsResponse>({
		url: ApiRoutes.MY_FILES_ANALYTICS,
		params,
		useToken: true,
	});

	return {
		data: query.data?.data ? normalizeAnalyticsData(query.data.data) : null,
		isLoading: query.isLoading,
		isError: query.isError,
		refetch: query.refetch,
	};
};

