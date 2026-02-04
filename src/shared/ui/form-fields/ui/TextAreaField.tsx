import { Form, Input } from 'antd';
import { CSSProperties } from 'react';

interface IProps {
    name: string;
    label: string;
    rules?: object[];
    placeholder?: string;
    style?: CSSProperties;
    rows?: number;
}

const { Item } = Form;
const { TextArea } = Input;

export const TextAreaField = ({
    name,
    label,
    rules,
    placeholder,
    style = { fontSize: '16px' },
    ...props
}: IProps) => {
    return (
        <Item
            label={label}
            name={name}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            rules={rules}
            className="custom-form-item"
        >
            <TextArea placeholder={placeholder} style={style} {...props} />
        </Item>
    );
};
