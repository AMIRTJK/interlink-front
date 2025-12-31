import { FC, useEffect, useState } from "react";
import { IFilterItem } from "../model";
import { Form, Select } from "antd";
import { useDebouncedCallback, useDynamicSearchParams } from "@shared/lib";

interface IProps {
  config: IFilterItem;
}

export const FilterSelect: FC<IProps> = ({ config }) => {
  const { params, setParams } = useDynamicSearchParams();
  const [value, setValue] = useState<string | undefined>(undefined);
  const { placeholder, name, options = [] } = config;

  const debouncedChange = useDebouncedCallback((val: unknown) => {
    setParams(name, val);
  }, 400);

  const handleChange = (selectedValue: string) => {
    setValue(selectedValue);
    // Если пользователь стер значение, отправляем пустую строку или undefined
    debouncedChange(selectedValue || undefined);
  };

  // Синхронизация с URL (например, при сбросе фильтров)
  useEffect(() => {
    setValue(params[name]);
  }, [params[name]]);

  return (
    <Form.Item name={name} noStyle>
      <Select
        showSearch // Включает возможность печатать в поле
        allowClear
        placeholder={placeholder}
        options={options}
        value={value}
        onChange={handleChange}
        // Настройка поиска: ищем по тексту (label), игнорируя регистр
        optionFilterProp="label"
        filterOption={(input, option) =>
          (option?.label ?? "")
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
      />
    </Form.Item>
  );
};
