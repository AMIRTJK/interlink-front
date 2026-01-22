import { useGetQuery } from "@shared/lib";
import { Form, Select } from "antd";
import { DefaultOptionType } from "antd/es/select";
import {
  CSSProperties,
  ReactElement,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from "react";

// внутри компонента SelectField

interface ISelectFieldProps {
  name: string;
  label?: ReactNode;
  rules?: object[];
  placeholder?: string;
  style?: CSSProperties;
  options?: DefaultOptionType[];
  className?: string;
  allowClear?: boolean;
  showSearch?: boolean;
  isFetchAllowed?: boolean;
  isMobile?: boolean;
  customClass?: string;
  url?: string; // Динамический URL для различных эндпоинтов
  transformResponse?: (
    data: unknown,
    extraParams?: unknown,
  ) => { value: string; label: string }[];
  method?: "GET";
  extraTransformParams?: unknown;
  searchParamKey?: string;
  onChange?: (
    value: number,
    option?: ReactElement | ReactElement[] | undefined,
  ) => void;
  mode?: "multiple" | "tags";
  autoComplete?: string;
  suffixIcon?: React.ReactNode;
  disabled?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
}

const { Option } = Select;

export const SelectField = ({
  name,
  label,
  rules,
  options,
  url,
  method = "GET",
  customClass,
  onChange,
  isFetchAllowed,
  transformResponse,
  mode,
  className = `${customClass}`,
  searchParamKey,
  suffixIcon,
  params: extraParams,
  ...props
}: ISelectFieldProps) => {
  const [items, setItems] = useState<unknown[]>([]);
  const [isFetched, setIsFetched] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const usedSearchParamKey = searchParamKey || "name";

  const queryParams = useMemo(
    () => ({
      ...(props.showSearch ? { [usedSearchParamKey]: searchTerm } : {}),
      ...extraParams,
    }),
    [props.showSearch, usedSearchParamKey, searchTerm, extraParams],
  );

  const { data, refetch, isFetching } = useGetQuery<unknown>({
    url: url!,
    method: method,
    params: queryParams,
    options: {
      enabled: false,
    },
  });

  // Функция загрузки данных
  const loadItems = useCallback(
    (open: boolean) => {
      if (open && !isFetched && url) {
        setIsFetched(true);
      }
    },
    [isFetched, url],
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setIsFetched(true);
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsFetched(true);
    refetch();
  };

  const handleChange = (value: unknown) => {
    if (value === undefined || value === null || value === "") {
      handleClear();
    }
  };

  const filterOption = url
    ? false
    : (input: string, option?: DefaultOptionType) =>
        (option?.label ?? "")
          .toString()
          .toLowerCase()
          .includes(input.toLowerCase());

  // Отображаем опции в выпадающем списке
  const renderOptions = (options ?? items).map((opt, index) => {
    const o = opt as DefaultOptionType;
    return (
      <Option key={`${o.value}-${index}`} value={o.value} label={o.label}>
        {o.label}
      </Option>
    );
  });

  useEffect(() => {
    if (!data) return;

    let formatted: DefaultOptionType[] = [];

    if (transformResponse) {
      formatted = transformResponse(data, props.extraTransformParams);
    } else if (
      typeof data === "object" &&
      data !== null &&
      "items" in data &&
      Array.isArray((data as { items: unknown }).items)
    ) {
      formatted = (data as { items: DefaultOptionType[] }).items;
    }

    setItems(formatted);
  }, [data, transformResponse, props.extraTransformParams]);

  useEffect(() => {
    if (isFetchAllowed) loadItems(true);
  }, [isFetchAllowed, loadItems]);

  useEffect(() => {
    if (isFetched && url) {
      refetch();
    }
    // Сбрасываем items при смене URL или параметров, чтобы не видеть старые данные
    if (url) setItems([]);
  }, [searchTerm, isFetched, url, queryParams, refetch]);

  return (
    <Form.Item
      rules={rules}
      label={label}
      name={name}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      className={className}
      style={props.style}
    >
      <Select
        mode={mode}
        loading={isFetching}
        onOpenChange={loadItems} // Вызываем загрузку данных при открытии выпадающего списка
        onSearch={url ? handleSearch : undefined}
        filterOption={filterOption}
        onChange={onChange ? onChange : handleChange}
        disabled={props.disabled}
        {...props}
        data-autocomplete="new-password"
        suffixIcon={suffixIcon}
      >
        {renderOptions}
      </Select>
    </Form.Item>
  );
};
