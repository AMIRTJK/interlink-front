import { TableColumnsType } from "antd";
import { useCorrespondenseIncomingColumns } from "./getCorrespondenseIncomingColumns";
import { useCorrespondenseOutgoingColumns } from "./getCorrespondenseOutgoingColumns";

export type RegistryType = "correspondence" | "crm" | "primary-documents";

export const useRegistryColumns = (type: string): TableColumnsType<any> => {
  const incomingColumns = useCorrespondenseIncomingColumns();
  const outgoingColumns = useCorrespondenseOutgoingColumns();

  switch (type) {
    case "incoming":
      return incomingColumns;
    case "outgoing":
      return outgoingColumns;
    default:
      return [];
  }
};

/**
 * @deprecated Use useRegistryColumns instead
 */
export const getRegistryColumns = useRegistryColumns;
