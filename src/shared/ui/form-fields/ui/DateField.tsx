import { DatePicker, Form } from "antd";
import { CSSProperties } from "react";

interface IProps {
  name: string;
  label?: string | boolean;
  rules?: object[];
  placeholder?: string;
  style?: CSSProperties;
  customClass?: string;
  className?: string;
}

const { Item } = Form;

export const DateField = ({
  name,
  label,
  rules,
  placeholder = "Дата",
  style = { width: "100%", padding: "10px", maxHeight: "40px" },
  customClass,
  className,
  ...props
}: IProps) => {
  return (
    <Item
      label={label}
      name={name}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      rules={rules}
      className={`custom-form-item ${customClass}`}
    >
      <DatePicker
        format="DD.MM.YYYY"
        style={style}
        placeholder={placeholder}
        suffixIcon={null}
        className={className}
        {...props}
      />

    </Item>
  );
};
