import { useGetQuery } from '@hooks';
import { Form, Select } from 'antd';
import { CSSProperties, ReactElement, useEffect, useState } from 'react';

// внутри компонента SelectField

interface ISelectFieldProps {
    name: string;
    label?: string | boolean;
    rules?: object[];
    placeholder?: string;
    style?: CSSProperties;
    options?: any[];
    className?: string;
    allowClear?: boolean;
    showSearch?: boolean;
    isFetchAllowed?: boolean;
    isMobile?: boolean;
    customClass?: string;
    url?: string; // Динамический URL для различных эндпоинтов
    dropdownStyle?: CSSProperties;
    transformResponse?: (data: any, extraParams?: any) => { value: string; label: string }[];
    method?: 'GET' | 'POST';
    extraTransformParams?: any;
    searchParamKey?: string;
    onChange?: (value: number, option: ReactElement) => void;
}

const { Option } = Select;

export const SelectField = ({
    name,
    label,
    rules,
    options,
    url,
    method = 'POST',
    customClass,
    onChange,
    isFetchAllowed,
    transformResponse,
    dropdownStyle = { maxHeight: 200, overflowY: 'auto' },
    className = `${customClass}`,
    ...props
}: ISelectFieldProps) => {
    const [items, setItems] = useState<any[]>([]);
    const [isFetched, setIsFetched] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchParamKey = props.searchParamKey || 'name';
    const params = props.showSearch ? { [searchParamKey]: searchTerm } : undefined;

    const { data, refetch, isFetching } = useGetQuery<any>({
        url: url!,
        method: method,
        params,
        options: {
            enabled: false,
        },
    });

    // Функция загрузки данных
    const loadItems = (open: boolean) => {
        if (open && !isFetched && url) {
            setIsFetched(true);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setIsFetched(true);
    };

    const handleClear = () => {
        setSearchTerm('');
        setIsFetched(true);
        refetch();
    };

    const handleChange = (value: any) => {
        if (value === undefined || value === null || value === '') {
            handleClear();
        }
    };

    const filterOption = url
        ? false
        : (input: string, option?: any) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase());

    // Отображаем опции в выпадающем списке
    const renderOptions = (options ?? items).map((opt, index) => (
        <Option key={`${opt.value}-${index}`} value={opt.value} label={opt.label} item={opt}>
            {opt.label}
        </Option>
    ));

    useEffect(() => {
        if (data) {
            const formatted = transformResponse
                ? transformResponse(data, props.extraTransformParams)
                : data.items || [];

            setItems(formatted);
        }
    }, [data, transformResponse, props.extraTransformParams]);

    useEffect(() => {
        if (isFetchAllowed) loadItems(true);
    }, [isFetchAllowed]);

    useEffect(() => {
        if (isFetched && url) {
            refetch();
        }
    }, [searchTerm, isFetched, url]);

    return (
        <Form.Item
            rules={rules}
            label={label}
            name={name}
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            className={className}
            style={props.style}
        >
            <Select
                loading={isFetching}
                onDropdownVisibleChange={loadItems} // Вызываем загрузку данных при открытии выпадающего списка
                onSearch={url ? handleSearch : undefined}
                filterOption={filterOption}
                onChange={onChange ? onChange : handleChange}
                {...props}
                {...({ autoComplete: 'new-password' } as any)}
            >
                {renderOptions}
            </Select>
        </Form.Item>
    );
};
