import type { ReactNode } from "react";
import type { TableColumnsType, TableProps } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import type { IFilterItem } from "../FiltersContainer";

export const DEFAULT_PAGE_SIZE = 10;

export const NUMERIC_FIELDS = [
  "creator_id",
  "assignee_user_id",
  "assignee_department_id",
  "page",
  "per_page",
];

export interface IProps<RecordType, ResponseType> {
  url?: string;
  filters?: IFilterItem[];
  columns: TableColumnsType<RecordType>;
  queryParams?: Record<string, any>;
  style?: string;
  getItemsFromResponse?: (response: ResponseType) => RecordType[];
  handleRowClick?: (row: RecordType) => void;
  dataSource?: RecordType[];
  rowClassName?: (record: RecordType, index: number) => string;
  title?: string;
  rowSelection?: TableRowSelection<RecordType>;
  idColumnHidden?: boolean;
  direction?: number;
  actionButton?: ReactNode;
  className?: string;
  autoFilter?: boolean;
  scroll?: { x?: number | string | true; y?: number | string };
  showSizeChanger?: boolean;
  customPagination?: boolean;
  expandable?: TableProps<RecordType>["expandable"];
  onRow?: (record: RecordType) => React.HTMLAttributes<any>;
}
