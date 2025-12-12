import { Form, Input } from 'antd';
import { CSSProperties } from 'react';

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
    addonBefore?: string;
    maxLength?: number;
    value?: string;
    className?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const { Item } = Form;

export const TextField = ({
    name,
    label,
    rules,
    placeholder,
    customClass,
    type,
    style = { padding: '10px', maxHeight: '40px' },
    ...props
}: IProps) => {
    const InputComponent = type === 'password' ? Input.Password : Input;

    return (
        <Item
            label={label}
            name={name}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={rules}
            className={`custom-form-item ${customClass} !mb-5`}
        >
            <InputComponent placeholder={placeholder} style={style} {...props} autoComplete="new-password" />
        </Item>
    );
};
