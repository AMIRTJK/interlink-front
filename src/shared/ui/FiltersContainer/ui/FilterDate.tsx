import { FC, useEffect } from "react";
import { IFilterItem } from "../model";
import { DatePicker, Form } from "antd";
import dayjs from "dayjs";
import { useDynamicSearchParams } from "@shared/lib";

const { RangePicker } = DatePicker;

interface IProps {
  config: IFilterItem;
}

export const FilterDate: FC<IProps> = ({ config }) => {
  const { params } = useDynamicSearchParams();
  const form = Form.useFormInstance();

  const { placeholder, name, rangeNames } = config;
  const [fromKey, toKey] = rangeNames || [name, name];

  useEffect(() => {
    const from = params[fromKey];
    const to = params[toKey];

    if (from && to) {
      form.setFieldValue(name, [dayjs(from), dayjs(to)]);
    } else {
      form.setFieldValue(name, null);
    }
  }, [params[fromKey], params[toKey], name, form]);

  return (
    <Form.Item name={name} noStyle>
      <RangePicker
        placeholder={placeholder as any}
        format="YYYY-MM-DD"
        style={{ width: "100%" }}
      />
    </Form.Item>
  );
};
