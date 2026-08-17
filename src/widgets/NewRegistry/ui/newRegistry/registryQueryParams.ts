import {
  REJECTED_TAB_KEY,
  REJECTION_TYPE_ALL,
  REJECTION_TYPE_PARAM,
} from "../../model";

interface IParams {
  currentTab: string;
  /** Запись вкладки из STATUS_CONFIG (apiParams / paramKey / omitStatus). */
  currentConfig: Record<string, any>;
  searchParams: Record<string, string>;
  extraParams?: Record<string, unknown>;
}

/**
 * Параметры запроса списка реестра: фильтры из URL плюс параметр активной
 * вкладки — `type` либо `status`, в зависимости от её конфигурации.
 */
export const buildRegistryQueryParams = ({
  currentTab,
  currentConfig,
  searchParams,
  extraParams,
}: IParams): Record<string, any> => {
  const params: Record<string, any> = {
    ...extraParams,
    ...searchParams,
    ...(currentConfig.apiParams || {}),
    page: searchParams.page || 1,
    per_page: searchParams.per_page || 9,
  };

  if (currentConfig.paramKey === "type") {
    params.type = currentTab;
    delete params.status;
  } else if (!currentConfig.omitStatus) {
    params.status = currentTab;
    delete params.type;
  }

  // Вкладка «Отменено»: сама вкладка в параметрах не участвует, а в `type`
  // уходит выбранный тип отклонения (all | approval | signature).
  if (currentTab === REJECTED_TAB_KEY) {
    params.type = searchParams[REJECTION_TYPE_PARAM] || REJECTION_TYPE_ALL;
    delete params[REJECTION_TYPE_PARAM];
    delete params.status;
  }

  return params;
};
