import { TableColumnsType } from "antd";
import { useCorrespondenseIncomingColumns } from "./getCorrespondenseIncomingColumns";
import { useCorrespondenseOutgoingColumns } from "./getCorrespondenseOutgoingColumns";

export type RegistryType = "correspondence" | "crm" | "primary-documents";

export const useRegistryColumns = (type: string): TableColumnsType<any> => {
  const incomingColumns = useCorrespondenseIncomingColumns();
  const outgoingColumns = useCorrespondenseOutgoingColumns();
  const archivedColumns = useCorrespondenseIncomingColumns(type);
  const pinnedColumns = useCorrespondenseIncomingColumns(type);
  const trashedColumns = useCorrespondenseIncomingColumns(type);

  switch (type) {
    case "incoming":
      return incomingColumns;
    case "outgoing":
      return outgoingColumns;
    case "archived":
      return archivedColumns;
    case "pinned":
      return pinnedColumns;
    case "trashed":
      return trashedColumns;
    case "internal-incoming":
      return incomingColumns;
    case "internal-outgoing":
      return outgoingColumns;
    default:
      return [];
  }
};

/**
 * @deprecated Use useRegistryColumns instead
 */
export const getRegistryColumns = useRegistryColumns;
