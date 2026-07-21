import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IFilesAnalyticsResponse } from "./analyticsModel";

interface IParams {
  months: number;
  limit: number;
}

export const useFilesAnalytics = (params: IParams) => {
  const query = useGetQuery<IParams, IFilesAnalyticsResponse>({
    url: ApiRoutes.MY_FILES_ANALYTICS,
    params,
    useToken: true,
  });

  return {
    data: query.data?.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
