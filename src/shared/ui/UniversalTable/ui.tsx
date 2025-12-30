import "./style.css";
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
  scroll?: { x?: number | string | true; y?: number | string };
  showSizeChanger?: boolean;
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
    props.getItemsFromResponse ??
    ((response: any) => response?.data?.data ?? []);

  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const page = searchParams.page;
  const perPage = searchParams.per_page;
  const currentFilterSource = autoFilter ? searchParams : activeFilters;

  const filterValues = useFilterValues(
    currentFilterSource ?? {},
    filters ?? []
  ) as Record<string, any>;

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
    const rawParams: Record<string, any> = {
      ...transformedFilters,
      ...queryParams,
      sort: queryParams?.sort || "id",
      dir: direction === 1 ? "desc" : "asc",
      page: Number(page) || 1,
      per_page: Number(perPage) || DEFAULT_PAGE_SIZE,
    };

    const cleanParams: Record<string, any> = {};

    Object.entries(rawParams).forEach(([key, value]) => {
      // Игнорируем пустые значения, чтобы не слать их в API
      if (value === undefined || value === null) return;
      // Приведение типов для числовых полей (согласно вашему API)
      const numericFields = [
        "creator_id",
        "assignee_user_id",
        "assignee_department_id",
        "page",
        "per_page",
      ];
      if (numericFields.includes(key)) {
        const num = Number(value);
        if (!isNaN(num)) cleanParams[key] = num;
        return;
      }

      cleanParams[key] = value;
    });

    return cleanParams;
  }, [queryParams, transformedFilters, page, perPage, direction]);

  const { data, isPending } = url
    ? useGetQuery({
        url,
        params,
      })
    : { data: undefined, isPending: false };

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
    setParams("page", 1);
  };

  const handleReset = () => {
    form.resetFields();
    if (autoFilter) {
      filters?.forEach((f) => setParams(f.name, undefined));
    } else {
      setActiveFilters({});
    }
    setParams("page", 1);
  };

  useEffect(() => {
    if (!perPage) setParams("per_page", DEFAULT_PAGE_SIZE);
    if (!page) setParams("page", 1);
  }, []);

  const filtersSnapshot = useMemo(
    () => JSON.stringify(transformedFilters),
    [transformedFilters]
  );

  useEffect(() => {
    if (autoFilter && page !== undefined && Number(page) !== 1) {
      setParams("page", 1);
    }
  }, [filtersSnapshot, autoFilter]);

  const tableData = (
    dataSource ??
    getItemsFromResponse(data as ResponseType) ??
    []
  ).map(formatDatesInObject);

  // console.log(tableData, "===========");

  return (
    <div>
      <If is={Boolean(filters)}>
        <div className={`w-full! mb-2 ${props.style}`}>
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
        scroll={"scroll" in props ? props.scroll : { y: "calc(100vh - 450px)" }}
        className={props.className}
        loading={isPending}
        dataSource={tableData}
        columns={columnsWithNumbers}
        rowKey={"id"}
        rowClassName={props.rowClassName}
        rowSelection={rowSelection}
        pagination={{
          total: (data as any)?.data?.total || 0,
          current: Number(page) || 1,
          pageSize: Number(perPage) || DEFAULT_PAGE_SIZE,
          pageSizeOptions: [10, 20, 50, 100],
          showSizeChanger: props.showSizeChanger ?? true,
          onChange(page, pageSize) {
            setParams("page", page);
            setParams("per_page", pageSize);
          },
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick?.(record),
        })}
      />
    </div>
  );
}
