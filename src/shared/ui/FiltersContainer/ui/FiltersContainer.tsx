import { FC } from 'react';
import { FilterType, IFilterItem } from '../model';
import { FilterInput } from './FilterInput';
import { FilterSelect } from './FilterSelect';
import { FilterDate } from './FilterDate';
import { Button, Form, FormInstance } from 'antd';

interface IProps {
    filters: IFilterItem[];
    onSearch: (filters: Record<string, any>) => void;
    onReset: () => void;
    form: FormInstance;
}

export const FiltersContainer: FC<IProps> = ({ filters, onSearch, onReset, form }) => {
    const renderFilter = (filter: IFilterItem) => {
        switch (filter.type) {
            case FilterType.INPUT:
                return <FilterInput config={filter} />;
            case FilterType.SELECT:
                return <FilterSelect config={filter} />;
            case FilterType.DATE:
                return <FilterDate config={filter} />;
            default:
                return null;
        }
    };

    const handleSearch = () => {
        const values = form.getFieldsValue();
        onSearch(values);
    };

    const handleReset = () => {
        form.resetFields();
        onReset();
    };

    return (
        <Form
            form={form}
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${filters.length + 1}, minmax(0, 1fr))` }}
        >
            {filters.map(renderFilter)}
            <div className="flex gap-2">
                <Button className="!w-[100px]" onClick={handleSearch}>
                    Поиск
                </Button>
                <Button className="!w-[100px]" onClick={handleReset}>
                    Сброс
                </Button>
            </div>
        </Form>
    );
};
