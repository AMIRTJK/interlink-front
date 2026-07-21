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

const normalizeSummary = (summary: IRawFilesAnalyticsSummary) => ({
	files_count: summary.total_files,
	folders_count: summary.total_folders,
	starred_count: summary.starred_files,
	shared_count: summary.shared_files,
});

const normalizeStorage = (storage: IRawFilesAnalyticsStorage) => ({
	used_bytes: storage.used_bytes,
	free_bytes: storage.free_bytes,
	total_bytes: storage.limit_bytes,
	used_pct: storage.usage_pct,
	used_bytes_human: storage.used_human,
	free_bytes_human: storage.free_human,
	total_bytes_human: storage.limit_human,
});

const normalizeTypeBreakdown = (
	items: IRawFilesAnalyticsData["type_breakdown"],
): IFilesTypeBreakdownItem[] =>
	items.map((item: IRawFilesTypeBreakdownItem) => ({
		type: item.type,
		count: item.file_count,
		total_size: item.total_size,
		total_size_human: item.total_size_human,
		percentage: item.percentage,
	}));

const normalizeFolderBreakdown = (
	breakdown: IRawFilesFolderBreakdown,
): IFilesFolderBreakdownItem[] => {
	const folders = Array.isArray(breakdown.folders)
		? breakdown.folders.map((folder) => ({
				folder_id: folder.id,
				folder_name: folder.name,
				emoji: folder.emoji ?? null,
				files_count: folder.file_count,
				total_size: folder.total_size,
				total_size_human: folder.total_size_human,
			}))
		: [];

	if (breakdown.without_folder) {
		folders.push({
			folder_id: null,
			folder_name: "",
			emoji: null,
			files_count: breakdown.without_folder.file_count,
			total_size: breakdown.without_folder.total_size,
			total_size_human: breakdown.without_folder.total_size_human,
		});
	}

	return folders;
};

const normalizeUploadActivity = (
	items: IRawFilesUploadActivityItem[],
): IFilesUploadActivityItem[] =>
	items.map((item) => ({
		month: item.period,
		count: item.file_count,
		total_size: item.total_size,
		total_size_human: item.total_size_human,
	}));

const normalizeAnalyticsData = (
	raw: IRawFilesAnalyticsData,
): IFilesAnalyticsData => ({
	summary: normalizeSummary(raw.summary),
	storage: normalizeStorage(raw.storage),
	type_breakdown: normalizeTypeBreakdown(raw.type_breakdown),
	folder_breakdown: normalizeFolderBreakdown(raw.folder_breakdown),
	upload_activity: normalizeUploadActivity(raw.upload_activity),
	recent_files: raw.recent_files,
	largest_files: raw.largest_files,
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

