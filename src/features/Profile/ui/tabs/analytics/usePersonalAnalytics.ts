import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import {
	IPersonalAnalyticsResponse,
	mapEventsByMonth,
	mapPriorityBreakdown,
	mapProgressItems,
	mapStatusBreakdown,
} from "./lib";

interface IPersonalAnalyticsParams {
	year?: number;
	limit?: number;
}

const cacheOptions = {
	staleTime: 5 * 60 * 1000,
	refetchOnWindowFocus: false,
};

export const usePersonalAnalytics = (params?: IPersonalAnalyticsParams) => {
	const query = useGetQuery<IPersonalAnalyticsParams, IPersonalAnalyticsResponse>({
		url: ApiRoutes.PERSONAL_ANALYTICS,
		params,
		useToken: true,
		options: cacheOptions,
	});

	const data = query.data?.data;

	return {
		year: data?.year,
		summary: data?.summary,
		statusData: mapStatusBreakdown(data?.tasks?.status_breakdown),
		priorityData: mapPriorityBreakdown(data?.tasks?.priority_breakdown),
		progressData: mapProgressItems(data?.tasks?.progress_items),
		calEventsData: mapEventsByMonth(data?.calendar?.events_by_month),
		isLoading: query.isLoading,
		isError: query.isError,
		refetch: query.refetch,
	};
};
