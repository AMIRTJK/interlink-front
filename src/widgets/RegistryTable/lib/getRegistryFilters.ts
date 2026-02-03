import { IFilterItem } from "@shared/ui";
import { getCorrespondenceIncomingFilters } from "./getCorrespondenseIncomingColumns";
import { getCorrespondenceOutgoingFilters } from "./getCorrespondenseOutgoingColumns";

export const getRegistryFilters = (type: string): IFilterItem[] => {
  const filtersMap: Record<string, () => IFilterItem[]> = {
    // Маппинг ключей на соответствующие функции
    incoming: getCorrespondenceIncomingFilters,
    outgoing: getCorrespondenceOutgoingFilters,
    archived: getCorrespondenceIncomingFilters,
    pinned: getCorrespondenceIncomingFilters,
    trashed: getCorrespondenceIncomingFilters,
    "internal-incoming": getCorrespondenceIncomingFilters,
    "internal-outgoing": getCorrespondenceOutgoingFilters,
    "internal-drafts": getCorrespondenceOutgoingFilters,

    // Если есть общий тип для всей корреспонденции (как фоллбек)
    correspondence: getCorrespondenceIncomingFilters,
  };

  const strategy = filtersMap[type];

  // Возвращаем результат выполнения функции или пустой массив
  return strategy ? strategy() : [];
};
