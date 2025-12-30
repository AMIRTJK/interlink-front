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

  const { placeholder, name, options = [], transform } = config;

  const debouncedChange = useDebouncedCallback((value: unknown) => {
    setParams(name, value);
  }, 400);

  const handleChange = (selectedValue: string) => {
    if (!selectedValue) {
      setValue(undefined);
      debouncedChange("");
      return;
    }
    setValue(selectedValue);
    debouncedChange(selectedValue);
  };

  useEffect(() => {
    if (params[name] !== value) {
      setValue(params[name]);
    }
  }, []);

  return (
    <Form.Item name={name} noStyle>
      <Select
        placeholder={placeholder}
        options={options}
        value={transform?.(value) || value}
        onChange={handleChange}
        allowClear
      />
    </Form.Item>
  );
};
