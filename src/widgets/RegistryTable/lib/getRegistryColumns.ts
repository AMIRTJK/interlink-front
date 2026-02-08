import { TableColumnsType } from "antd";
import { useCorrespondenseIncomingColumns } from "./getCorrespondenseIncomingColumns";
import { useCorrespondenseOutgoingColumns } from "./getCorrespondenseOutgoingColumns";

export type RegistryType = "correspondence" | "crm" | "primary-documents";

export const useRegistryColumns = (type: string): TableColumnsType<any> => {
  // EXTERNAL
  const mainExternalColumns = useCorrespondenseIncomingColumns(type);
  const incomingColumns = useCorrespondenseIncomingColumns(type);
  const outgoingColumns = useCorrespondenseOutgoingColumns(type);

  switch (type) {
    case "external-incoming":
      return incomingColumns;
    case "external-outgoing":
      return outgoingColumns;

    // Внутренние
    case "internal-incoming":
      return incomingColumns;
    case "internal-outgoing":
      return outgoingColumns;
    case "internal-drafts":
      return outgoingColumns;
    case "internal-to-sign":
      return outgoingColumns;
    case "internal-to-approve":
      return outgoingColumns;

    // Служебные
    case "archived":
    case "pinned":
    case "trashed":
    case "internal-archived":
    case "internal-pinned":
      return mainExternalColumns;
    case "internal-trashed":
      return outgoingColumns;

    default:
      return [];
  }
};

/**
 * @deprecated Use useRegistryColumns instead
 */
export const getRegistryColumns = useRegistryColumns;
