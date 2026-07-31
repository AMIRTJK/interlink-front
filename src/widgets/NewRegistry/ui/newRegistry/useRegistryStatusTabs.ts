import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { _axios } from "@shared/api";
import { STATUS_CONFIG } from "./newRegistryModel";

interface IParams {
	activeStatusKeys: string[];
	counts: Record<string, any>;
	currentTab: string;
	metaTotal?: number;
	fetchUrl: string;
	extraParams?: Record<string, unknown>;
}

/**
 * Вкладки статусов со счётчиками. Часть счётчиков бэкенд отдаёт нулями, поэтому
 * для «проблемных» вкладок количество дозапрашивается отдельными запросами
 * с per_page: 1 и берётся из меты ответа.
 */
export const useRegistryStatusTabs = ({
	activeStatusKeys,
	counts,
	currentTab,
	metaTotal,
	fetchUrl,
	extraParams,
}: IParams) => {
	// Запрашиваем мета-данные для счетчиков проблемных вкладок (бэкенд может отдавать 0)
	const tabsToFetch = useMemo(() => {
		return activeStatusKeys.filter((key) => {
			// Принудительно запрашиваем мета-данные для счетчиков проблемных вкладок
			if (["approved", "signed", "sent", "analysis"].includes(key)) {
				return true;
			}
			const existingCount =
				counts[key] ??
				counts[key.replace("-", "_")] ??
				counts[`${key}_total`] ??
				counts[`${key.replace("-", "_")}_total`] ??
				counts[`${key}_count`];
			return existingCount === undefined || existingCount === null;
		});
	}, [activeStatusKeys, counts]);

	const fallbackQueries = useQueries({
		queries: tabsToFetch.map((key) => {
			const config = STATUS_CONFIG[key] || {};
			const configUrl = config.apiUrl || fetchUrl;
			const configParams = config.apiParams || {};

			const queryParams: Record<string, any> = {
				...extraParams,
				...configParams,
				per_page: 1,
			};

			if (config.paramKey === "type") {
				queryParams.type = key;
			} else if (!config.omitStatus) {
				queryParams.status = key;
			}

			return {
				queryKey: [configUrl, queryParams],
				queryFn: async () => {
					const res = await _axios.get(configUrl, {
						params: queryParams,
					});
					const serverData = res.data;
					const fetchedMeta =
						serverData?.data?.meta ||
						serverData?.meta ||
						serverData?.data ||
						serverData;

					return { key, total: fetchedMeta?.total ?? 0 };
				},
				staleTime: 5000,
				keepPreviousData: true,
			};
		}),
	});

	const fallbackCounts = useMemo(() => {
		const obj: Record<string, number> = {};
		fallbackQueries.forEach((q) => {
			if (q.data) {
				obj[q.data.key] = q.data.total;
			}
		});
		return obj;
	}, [fallbackQueries]);

	return useMemo(() => {
		return activeStatusKeys
			.map((key) => {
				const config = STATUS_CONFIG[key];
				if (!config) return null;
				let count =
					fallbackCounts[key] ??
					counts[key] ??
					counts[key.replace("-", "_")] ??
					counts[`${key}_total`] ??
					counts[`${key.replace("-", "_")}_total`] ??
					counts[`${key}_count`] ??
					0;

				if (key === currentTab && metaTotal !== undefined) {
					count = metaTotal;
				}

				return {
					id: key,
					label: config.label,
					icon: config.icon,
					gradient: config.gradient,
					count,
				};
			})
			.filter(Boolean);
	}, [counts, activeStatusKeys, currentTab, metaTotal, fallbackCounts]);
};
