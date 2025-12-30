import { TableColumnsType } from "antd";
import { getCorrespondenseIncomingColumns } from "./getCorrespondenseIncomingColumns";
import { getCorrespondenseOutgoingColumns } from "./getCorrespondenseOutgoingColumns";

export type RegistryType = "correspondence" | "crm" | "primary-documents";

// Маппинг: ключ — это тип, значение — функция возвращающая колонки
const columnsStrategy: Record<string, () => TableColumnsType<any>> = {
  incoming: getCorrespondenseIncomingColumns,
  outgoing: getCorrespondenseOutgoingColumns,
};

export const getRegistryColumns = (type: string): TableColumnsType<any> => {
  const strategy = columnsStrategy[type];

  // Возвращаем пустой массив или дефолтные колонки, если тип не найден
  return strategy ? strategy() : [];
};
