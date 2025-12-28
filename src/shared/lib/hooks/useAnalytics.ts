import { useMutation } from "@tanstack/react-query";
import { _axios } from "@shared/api/http";
import { ApiRoutes } from "@shared/api/api-routes";
// TODO: Fix import path after moving hook to shared
import { IAnalyticsData, IAnalyticsRequest } from "@features/analytics/model/types";

// Мок-данные для демонстрации, пока нет API
const mockData: IAnalyticsData = {
  hero: {
    totalTasks: 128,
    completionRate: 78,
    overdueCount: 4,
    averageTime: "1ч 45м",
  },
  activity: Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 10) + 1,
    };
  }),
};

// Хук для получения данных аналитики
export const useAnalytics = () => {
  return useMutation({
    mutationFn: async (data: IAnalyticsRequest) => {
      try {
        const response = await _axios.post<IAnalyticsData>(ApiRoutes.GET_ANALYTICS, data);
        if (!response.data) {
           return mockData;
        }
        return response.data;
      } catch (error) {
        console.warn("Analytics fetch failed, using mock data", error);
        // Возвращаем мок-данные при ошибке
        return mockData;
      }
    },
  });
};
