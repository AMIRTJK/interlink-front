import { useMemo } from "react";
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
  year?: number; // год для календарной статистики (по умолчанию — текущий на бэке)
  limit?: number; // кол-во задач в блоке прогресса (по умолчанию 12 на бэке)
}

/**
 * Данные вкладки «Аналитика» личного кабинета.
 *
 * Дёргает GET /api/v1/personal-analytics (только текущий авторизованный
 * пользователь) и отдаёт готовый view-model для KPI-карточек и графиков.
 * Параметры year/limit передаём только если их задаёт UI — иначе полагаемся
 * на дефолты бэкенда (текущий год, 12 задач).
 */
export const usePersonalAnalytics = (params?: IPersonalAnalyticsParams) => {
  const query = useGetQuery<IPersonalAnalyticsParams, IPersonalAnalyticsResponse>({
    url: ApiRoutes.PERSONAL_ANALYTICS,
    params,
    useToken: true,
  });

  const data = query.data?.data;

  const statusData = useMemo(
    () => mapStatusBreakdown(data?.tasks?.status_breakdown),
    [data],
  );
  const priorityData = useMemo(
    () => mapPriorityBreakdown(data?.tasks?.priority_breakdown),
    [data],
  );
  const progressData = useMemo(
    () => mapProgressItems(data?.tasks?.progress_items),
    [data],
  );
  const calEventsData = useMemo(
    () => mapEventsByMonth(data?.calendar?.events_by_month),
    [data],
  );

  return {
    year: data?.year,
    summary: data?.summary,
    statusData,
    priorityData,
    progressData,
    calEventsData,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
