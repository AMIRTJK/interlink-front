import "./style.css";
import { Form, Table, TableColumnsType, TableProps } from "antd";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  FiltersContainer,
  FilterType,
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
import { UseSkeleton } from "../Skeleton/ui";

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
  customPagination?: boolean;
  expandable?: TableProps<RecordType>["expandable"];
  onRow?: (record: RecordType) => React.HTMLAttributes<any>;
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
    customPagination,
    expandable,
    onRow,
  } = props;

  const { params: searchParams, setParams } = useDynamicSearchParams();

  const [form] = Form.useForm();

  const getItemsFromResponse =
    props.getItemsFromResponse ??
    ((response: any) => response?.data?.items ?? []);
  // ((response: any) => response?.data?.data ?? []);

  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const page = searchParams.page;
  const perPage = searchParams.per_page;
  const currentFilterSource = autoFilter ? searchParams : activeFilters;

  const filterValues = useFilterValues(
    currentFilterSource ?? {},
    filters ?? []
  ) as Record<string, any>;

  const transformedFilters = useMemo(() => {
    return transformFilterValues(filterValues, filters ?? []);
  }, [filterValues, filters]);

  const params = useMemo(() => {
    const baseParams = { ...queryParams };
    const currentFilters = autoFilter ? searchParams : transformedFilters;

    const rawParams: Record<string, any> = {
      ...baseParams,
      ...currentFilters,
      sort: queryParams?.sort || "id",
      dir: direction === 1 ? "desc" : "asc",
      page: Number(page) || 1,
      per_page: Number(perPage) || DEFAULT_PAGE_SIZE,
    };

    const cleanParams: Record<string, any> = {};

    Object.entries(rawParams).forEach(([key, value]) => {
      const filterConfig = filters?.find((f) => f.name === key);
      if (
        filterConfig &&
        filterConfig.type === FilterType.DATE &&
        filterConfig.rangeNames
      ) {
        return; // Пропускаем 'date_range', так как у нас есть 'date_from' и 'date_to'
      }

      // Игнорируем параметры, которые нужны только для UI (чтобы они не улетали в API)
      if (key === "defaultFolder") return;

      // Игнорируем пустые значения, чтобы не слать их в API
      if (value === undefined || value === null || value === "") return;
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
  }, [
    queryParams,
    searchParams,
    transformedFilters,
    autoFilter,
    page,
    perPage,
    direction,
    filters,
  ]);

  const { data, isPending, refetch } = url
    ? useGetQuery({
        url,
        params,
      })
    : { data: undefined, isPending: false, refetch: () => {} };

  useEffect(() => {
    const handleMove = () => refetch();
    window.addEventListener('correspondence-moved', handleMove);
    return () => window.removeEventListener('correspondence-moved', handleMove);
  }, [refetch]);

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
      filters?.forEach((f) => {
        if (f.type === FilterType.DATE && f.rangeNames) {
          // Если это диапазон, сбрасываем оба спец-ключа
          setParams(f.rangeNames[0], undefined);
          setParams(f.rangeNames[1], undefined);
        }
        // Сбрасываем основной ключ
        setParams(f.name, undefined);
      });
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

  // Skeleton 
  if(isPending){
    return <UseSkeleton loading={true} variant="table" count={1} rows={19}  />
  }else{
  return (
    <div
      className={
        customPagination
          ? "custom-pagination h-full flex flex-col"
          : "h-full flex flex-col"
      }
    >
      {" "}
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
        expandable={expandable}
        rowClassName={props.rowClassName}
        rowSelection={rowSelection}
        pagination={{
          total: (data as any)?.data?.meta?.total || 0,
          // total: (data as any)?.data?.total || 0,
          current: Number(page) || 1,
          pageSize: Number(perPage) || DEFAULT_PAGE_SIZE,
          pageSizeOptions: [10, 20, 50, 100],
          showSizeChanger: props.showSizeChanger ?? true,
          onChange(page, pageSize) {
            setParams("page", page);
            setParams("per_page", pageSize);
          },
          // ... внутри UniversalTable в пропсе pagination компонента Table

          itemRender: (current, type, originalElement) => {
            if (!customPagination) return originalElement;

            const btnClassName =
              "flex items-center h-9 gap-2 px-4 py-1 border border-[#C9D4EB] rounded-lg text-[#0037AF] transition-all";
            const isDisabled = (originalElement as any).props.disabled;
            const activeStyles = isDisabled
              ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400"
              : "hover:opacity-80 cursor-pointer active:scale-95";

            if (type === "prev") {
              return (
                <div
                  className={`${btnClassName} ${activeStyles}`}
                  role="button"
                  aria-label="Предыдущая страница"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    role="img"
                    aria-label="Стрелка влево"
                  >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  <span className="text-sm font-medium">Назад</span>
                </div>
              );
            }

            if (type === "next") {
              return (
                <div
                  className={`${btnClassName} ${activeStyles}`}
                  role="button"
                  aria-label="Следующая страница"
                >
                  <span className="text-sm font-medium">Дальше</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    role="img"
                    aria-label="Стрелка вправо"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              );
            }
            return originalElement;
          },
        }}
        onRow={(record) => {
          const rowProps = onRow ? onRow(record) : {};
          return {
            ...rowProps,
            onTitleClick: () => {
              // Ant Design Menu workaround if needed
            },
            onClick: (e) => {
              rowProps.onClick?.(e);
              handleRowClick?.(record);
            },
          };
        }}
      />
    </div>
  );
}
}
