import { Form, Table, TableColumnsType } from "antd";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  FiltersContainer,
  IFilterItem,
  useFilterValues,
} from "../FiltersContainer";
import { If } from "../If";
import { TableRowSelection } from "antd/es/table/interface";
import {
  formatDatesInObject,
  useDynamicSearchParams,
  useGetQuery,
} from "@shared/lib";
import { transformFilterValues } from "./lib";

const DEFAULT_PAGE_SIZE = 10;

interface IProps<RecordType, ResponseType> {
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
}

export function UniversalTable<RecordType = any, ResponseType = any>(
  props: IProps<RecordType, ResponseType>
) {
  const {
    columns,
    url,
    queryParams,
    filters,
    handleRowClick,
    dataSource,
    title,
    rowSelection,
    idColumnHidden, // Новый пропс для скрывание ID колонки
    direction = 0,
    actionButton,
    autoFilter = true,
  } = props;

  const { params: searchParams, setParams } = useDynamicSearchParams();

  const [form] = Form.useForm();

  const getItemsFromResponse =
    props.getItemsFromResponse ?? ((response: any) => response?.items ?? []);

  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const currentFilterSource = autoFilter ? searchParams : activeFilters;
  const filterValues = useFilterValues(
    currentFilterSource ?? {},
    filters ?? []
  ) as Record<string, any>;

  const { pageNumber, pageSize } = searchParams;

  const transformedFilters = useMemo(() => {
    return Object.keys(filterValues).reduce(
      (acc, key) => {
        const filterConfig = filters?.find((f) => f.name === key);
        let value = filterValues[key];

        if (filterConfig) {
          if (typeof filterConfig.transform === "function") {
            value = filterConfig.transform(value, filterConfig.options);
          } else if (filterConfig.options && typeof value === "string") {
            const option = filterConfig.options.find((o) => o.label === value);
            if (option) {
              value = option.value;
            }
          }
        }

        acc[key] = value;
        return acc;
      },
      {} as Record<string, any>
    );
  }, [filterValues, filters]);

  const params = useMemo(() => {
    return {
      ...queryParams,
      ids: null,
      filters: {
        ...(queryParams?.filters ?? {}),
        ...transformedFilters,
      },
      orderBy: {
        orderColumn: 1,
        direction: direction,
      },
      pageInfo: {
        pageNumber: Number(pageNumber) || 1,
        pageSize: Number(pageSize) || DEFAULT_PAGE_SIZE,
      },
    };
  }, [queryParams, transformedFilters, pageNumber, pageSize, direction]);

  const { data, isLoading } = url
    ? useGetQuery({
        url,
        params,
      })
    : { data: undefined, isLoading: false };

  const columnsWithNumbers = useMemo(() => {
    // Добавляем колонку ID только если idColumnHidden !== true
    return idColumnHidden
      ? [...columns]
      : [
          {
            title: "ID",
            dataIndex: "id",
            key: "id",
            render: (_: any, record: any) => record.id,
          },
          ...columns,
        ];
  }, [columns, idColumnHidden]);

  const handleSearch = (values: Record<string, any>) => {
    const transformed = transformFilterValues(values, filters ?? []);
    if (autoFilter) {
      Object.entries(transformed).forEach(([key, value]) =>
        setParams(key, value)
      );
    } else {
      setActiveFilters(transformed);
    }
    setParams("pageNumber", 1);
  };

  const handleReset = () => {
    form.resetFields();
    if (autoFilter) {
      filters?.forEach((f) => setParams(f.name, undefined));
    } else {
      setActiveFilters({});
    }
    setParams("pageNumber", 1);
  };

  useEffect(() => {
    if (!pageSize) setParams("pageSize", DEFAULT_PAGE_SIZE);
    if (!pageNumber) setParams("pageNumber", 1);
  }, []);

  useEffect(() => {
    if (autoFilter) {
      setParams("pageNumber", 1);
    }
    return;
  }, [transformedFilters]);

  const tableData = (
    dataSource ??
    getItemsFromResponse(data as ResponseType) ??
    []
  ).map(formatDatesInObject);

  return (
    <div className="">
      <If is={Boolean(filters)}>
        <div className={`flex items-center pb-5 px-5 pt-2  ${props.style}`}>
          {title && <h2 className="mr-auto text-lg font-semibold">{title}</h2>}
          <FiltersContainer
            filters={filters ?? []}
            onSearch={handleSearch}
            onReset={handleReset}
            form={form}
          />
          <If is={actionButton}>{actionButton}</If>
        </div>
      </If>
      <Table
        scroll={{ y: "calc(100vh - 450px)" }}
        className={props.className}
        loading={isLoading}
        dataSource={tableData}
        columns={columnsWithNumbers}
        rowKey={"id"}
        rowClassName={props.rowClassName}
        rowSelection={rowSelection}
        onRow={(record) => ({
          onClick: () => handleRowClick?.(record),
        })}
        pagination={{
          // Тестово указал, тут должно прийди из сервиса
          total: 10,
          defaultPageSize: DEFAULT_PAGE_SIZE,
          current: Number(pageNumber) || 1,
          pageSize: Number(pageSize) || DEFAULT_PAGE_SIZE,
          pageSizeOptions: [10, 20, 30],
          showSizeChanger: true,
          onChange(page, pageSize) {
            setParams("pageNumber", page);
            setParams("pageSize", pageSize);
          },
        }}
      />
    </div>
  );
}
