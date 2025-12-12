import { ApiRoutes } from '@config';
import { AutoComplete, Input } from 'antd';
import { FC } from 'react';

interface IProps {
    url: ApiRoutes;
}

export const CustomAutocomplete: FC<IProps> = () => {
    return (
        <AutoComplete
            popupMatchSelectWidth={252}
            style={{ width: 300 }}
            options={[]}
            onSelect={() => null}
            onSearch={() => {}}
        >
            <Input.Search size="large" placeholder="input here" enterButton />
        </AutoComplete>
    );
};
