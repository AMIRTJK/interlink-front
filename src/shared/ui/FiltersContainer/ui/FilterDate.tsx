// Исправленная версия
import { FC, useEffect, useState } from "react";
import { IFilterItem } from "../model";
import { DatePicker, Form } from "antd";
import dayjs from "dayjs";
import { useDebouncedCallback, useDynamicSearchParams } from "@shared/lib";

interface IProps {
  config: IFilterItem;
}

export const FilterDate: FC<IProps> = ({ config }) => {
  const { params, setParams } = useDynamicSearchParams();
  const [value, setValue] = useState<dayjs.Dayjs | null>(null);

  const { placeholder, name } = config;

  const debouncedChange = useDebouncedCallback((value: unknown) => {
    setParams(name, value);
  }, 400);

  const handleChange = (date: dayjs.Dayjs | null) => {
    if (!date) {
      setValue(null);
      debouncedChange("");
      return;
    }
    setValue(date);
    debouncedChange(date.format("YYYY-MM-DD"));
  };

  useEffect(() => {
    const paramValue = params[name];
    if (paramValue && dayjs(paramValue).isValid()) {
      setValue(dayjs(paramValue));
    } else {
      setValue(null);
    }
  }, [params[name]]);

  return (
    <Form.Item name={name} noStyle>
      <DatePicker
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        format="YYYY-MM-DD"
      />
    </Form.Item>
  );
};

// ---------------------------------------
// Исходная версия
// import { FC, useEffect, useState } from 'react';
// import { IFilterItem } from '../model';
// import { DatePicker } from 'antd';
// import { useDebouncedCallback, useDynamicSearchParams } from '@hooks';
// import { Dayjs } from 'dayjs';

// interface IProps {
//     config: IFilterItem;
// }

// export const FilterDate: FC<IProps> = ({ config }) => {
//     const { params, setParams } = useDynamicSearchParams();

//     const [value, setValue] = useState<Nullable<Dayjs>>(null);

//     const { placeholder, name } = config;

//     const debouncedChange = useDebouncedCallback((value: string) => {
//         setParams(name, value);
//     }, 400);

//     const handleChange = (date: Dayjs) => {
//         if (!date) {
//             setValue(null);
//             debouncedChange('');
//             return;
//         }
//         setValue(date);
//         debouncedChange(date.toISOString());
//     };

//     useEffect(() => {
//         if (params[name] !== value?.toString()) {
//             setValue(new Dayjs(params[name]));
//         }
//     }, []);

//     return <DatePicker placeholder={placeholder} value={value} onChange={handleChange} />;
// };
