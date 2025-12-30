import { useMemo } from 'react';
import { IFilterItem } from '../model';

export const useFilterValues = (params: any, filters: IFilterItem[]) => {
    const deps = filters.map((filter) => params[filter.name]);

    const values = useMemo(() => {
        const values = filters.reduce((acc, filter) => {
            if (params[filter.name]) {
                return {
                    ...acc,
                    [filter.name]: params[filter.name],
                };
            }

            return acc;
        }, {});

        return values;
    }, [...deps]);

    return values;
};
