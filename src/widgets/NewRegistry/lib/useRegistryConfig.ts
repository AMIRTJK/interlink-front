import { REJECTED_TAB_KEY } from "../model";
import { useIncomingConfig } from "./incoming-config";
import { useOutgoingConfig } from "./outgoing-config";
import { REJECTED_FIELDS } from "./rejected-config";
import { getRejectedFilters } from "./filters.config";
import { RegistryConfig } from "./types";

/**
 * Конфиг полей и действий реестра. `activeTab` нужен вкладке «Отменено»:
 * у неё свои колонки (кто и почему отклонил) и свой набор фильтров, а действия
 * над письмом остаются те же, что в реестре исходящих.
 */
export const useRegistryConfig = (
  type: string,
  activeTab?: string,
): RegistryConfig => {
  const incomingConfig = useIncomingConfig(type);
  const outgoingConfig = useOutgoingConfig(type);

  switch (type) {
    // Входящие
    case "external-incoming":
    case "internal-incoming":
    case "archived":
    case "pinned":
    case "trashed":
    case "internal-archived":
    case "internal-pinned":
      return incomingConfig;

    // Исходящие / Проекты
    case "external-outgoing":
    case "internal-outgoing":
    case "internal-drafts":
    case "internal-to-sign":
    case "internal-to-approve":
    case "internal-trashed":
      if (activeTab === REJECTED_TAB_KEY) {
        return {
          ...outgoingConfig,
          ...REJECTED_FIELDS,
          filters: getRejectedFilters(),
        };
      }
      return outgoingConfig;

    default:
      return incomingConfig;
  }
};
