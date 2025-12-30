const isISODateString = (value: any): boolean => {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
};

const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('ru-RU');
};

export const formatDatesInObject = <T extends Record<string, any>>(obj: T): T => {
    const result: Record<string, any> = { ...obj };

    Object.keys(result).forEach((key) => {
        const value = result[key];
        if (typeof value === 'string' && /date|created|updated/i.test(key) && isISODateString(value)) {
            result[key] = formatDate(value);
        }
    });

    return result as T;
};
