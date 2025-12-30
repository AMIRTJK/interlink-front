import { IFilterItem } from "../FiltersContainer";

export const transformFilterValues = (
  rawValues: Record<string, any>,
  filters: IFilterItem[]
): Record<string, any> => {
  return Object.entries(rawValues).reduce(
    (acc, [key, rawValue]) => {
      const filter = filters.find((f) => f.name === key);

      if (!filter) {
        acc[key] = rawValue;
        return acc;
      }

      const { transform, options } = filter;

      switch (true) {
        case typeof transform === "function":
          acc[key] = transform(rawValue, options);
          break;

        case !!options && typeof rawValue === "string":
          const matchedOption = options.find((o) => o.label === rawValue);
          acc[key] = matchedOption ? matchedOption.value : rawValue;
          break;

        default:
          acc[key] = rawValue;
          break;
      }

      return acc;
    },
    {} as Record<string, any>
  );
};
