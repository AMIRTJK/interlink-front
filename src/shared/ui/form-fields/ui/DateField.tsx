import { DatePicker, Form } from "antd";
import { CSSProperties, ReactNode } from "react";
import dayjs from "dayjs";

interface IProps {
  name: string;
  label?: ReactNode;
  rules?: object[];
  placeholder?: string;
  style?: CSSProperties;
  customClass?: string;
  className?: string;
  suffixIcon?: ReactNode;
}

const { Item } = Form;

export const DateField = ({
  name,
  label,
  rules,
  placeholder = "Дата",
  customClass,
  className,
  suffixIcon = false,
  ...props
}: IProps) => {
  return (
    <Item
      label={label}
      name={name}
      getValueProps={(i) => ({
        value: i && dayjs(i).isValid() ? dayjs(i) : undefined,
      })}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      rules={rules}
      className={`custom-form-item ${customClass}`}
    >
      <DatePicker
        format="DD.MM.YYYY"
        placeholder={placeholder}
        suffixIcon={suffixIcon}
        className={className}
        {...props}
      />
    </Item>
  );
};
