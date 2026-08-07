import { useEffect, useMemo, useState } from "react";
import { Form } from "antd";
import { FilterType, useFilterValues } from "../FiltersContainer";
import { formatDatesInObject, useDynamicSearchParams, useGetQuery, sortCorrespondenceById } from "@shared/lib";
import { transformFilterValues } from "./lib";
import { DEFAULT_PAGE_SIZE, NUMERIC_FIELDS, IProps } from "./model";

export function useUniversalTableState<RecordType = any, ResponseType = any>(
  props: IProps<RecordType, ResponseType>
) {
  const {
    columns,
    url,
    queryParams,
    filters,
    dataSource,
    idColumnHidden,
    direction = 0,
    autoFilter = true,
  } = props;

  const { params: searchParams, setParams } = useDynamicSearchParams();
  const [form] = Form.useForm();

  const getItemsFromResponse =
    props.getItemsFromResponse ??
    ((response: any) => {
      const data = response?.data;
      if (!data) return [];
      if (Array.isArray(data)) return data;
      return data.data ?? data.items ?? [];
    });

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
        return;
      }

      if (key === "defaultFolder") return;
      if (value === undefined || value === null || value === "") return;

      if (NUMERIC_FIELDS.includes(key)) {
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
    window.addEventListener("correspondence-moved", handleMove);
    return () => window.removeEventListener("correspondence-moved", handleMove);
  }, [refetch]);

  const columnsWithNumbers = useMemo(() => {
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
          setParams(f.rangeNames[0], undefined);
          setParams(f.rangeNames[1], undefined);
        }
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

  const rawTableData = (
    dataSource ??
    getItemsFromResponse(data as ResponseType) ??
    []
  ).map(formatDatesInObject);

  const tableData = useMemo(
    () => sortCorrespondenceById(rawTableData) as RecordType[],
    [rawTableData]
  );

  const total = (data as any)?.data?.meta?.total || (data as any)?.data?.total || 0;

  return {
    form,
    page: Number(page) || 1,
    perPage: Number(perPage) || DEFAULT_PAGE_SIZE,
    isPending,
    columnsWithNumbers,
    handleSearch,
    handleReset,
    tableData,
    total,
    setParams,
  };
}
