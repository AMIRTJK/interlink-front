import { FC, useEffect, useState } from "react";
import { IFilterItem } from "../model";
import { Form, Input } from "antd";
import { useDebouncedCallback, useDynamicSearchParams } from "@shared/lib";

interface IProps {
  config: IFilterItem;
}

export const FilterInput: FC<IProps> = ({ config }) => {
  const { params, setParams } = useDynamicSearchParams();

  const [value, setValue] = useState("");

  const { placeholder, name, inputProps } = config;

  const debouncedChange = useDebouncedCallback((value: unknown) => {
    setParams(name, value);
  }, 400);

  const handleChange = (e: any) => {
    setValue(e.target.value);
    debouncedChange(e.target.value);
  };

  useEffect(() => {
    if (params[name] !== value) {
      setValue(params[name]);
    }
  }, []);

  return (
    <Form.Item name={name} noStyle>
      <Input
        {...inputProps}
        placeholder={placeholder}
        onChange={handleChange}
        value={value}
      />
    </Form.Item>
  );
};
