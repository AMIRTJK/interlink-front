import { TableColumnsType } from "antd";
import { useCorrespondenseIncomingColumns } from "./getCorrespondenseIncomingColumns";
import { useCorrespondenseOutgoingColumns } from "./getCorrespondenseOutgoingColumns";

export type RegistryType = "correspondence" | "crm" | "primary-documents";

export const useRegistryColumns = (type: string): TableColumnsType<any> => {
  const incomingColumns = useCorrespondenseIncomingColumns();
  const outgoingColumns = useCorrespondenseOutgoingColumns();
  const archivedColumns = useCorrespondenseIncomingColumns();
  const pinnedColumns = useCorrespondenseIncomingColumns();
  const trashedColumns = useCorrespondenseIncomingColumns();

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
    default:
      return [];
  }
};

/**
 * @deprecated Use useRegistryColumns instead
 */
export const getRegistryColumns = useRegistryColumns;
