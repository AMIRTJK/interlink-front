import { Form, Input } from "antd";
import { CSSProperties, ReactNode } from "react";

interface IProps {
  name: string | number | (string | number)[];
  label?: string | boolean;
  rules?: object[];
  placeholder?: string;
  disabled?: boolean;
  style?: CSSProperties;
  type?: string;
  readOnly?: boolean;
  customClass?: string;
  addonBefore?: React.ReactNode;
  maxLength?: number;
  value?: string;
  className?: string;
  prefix?: ReactNode;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  iconRender?: (visible: boolean) => ReactNode;
}

const { Item } = Form;

export const TextField = ({
  name,
  label,
  rules,
  placeholder,
  customClass,
  type,
  iconRender,
  ...props
}: IProps) => {
  const InputComponent = type === "password" ? Input.Password : Input;

  return (
    <Item
      label={label}
      name={name}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      rules={rules}
      className={`custom-form-item ${customClass}`}
    >
      <InputComponent
        placeholder={placeholder}
        autoComplete="new-password"
        {...(type === "password" ? { iconRender } : {})}
        {...props}
      />
    </Item>
  );
};
