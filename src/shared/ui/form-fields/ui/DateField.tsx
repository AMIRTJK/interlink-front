import { DatePicker, Form } from 'antd';
import { CSSProperties } from 'react';

interface IProps {
    name: string;
    label: string;
    rules?: object[];
    placeholder?: string;
    style?: CSSProperties;
}

const { Item } = Form;

export const DateField = ({
    name,
    label,
    rules,
    placeholder,
    style = { width: '100%', padding: '10px', maxHeight: '40px' },
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
            <DatePicker format="DD.MM.YYYY" style={style} placeholder="Дата" suffixIcon={null} {...props} />
        </Item>
    );
};
