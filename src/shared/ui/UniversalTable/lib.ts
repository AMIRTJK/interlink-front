import { FilterType, IFilterItem } from "../FiltersContainer";
import dayjs from "dayjs";

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

      const { transform, options, type, rangeNames } = filter;

      if (
        (type === FilterType.DATE || type === FilterType.DATE_RANGE) &&
        rangeNames &&
        Array.isArray(rawValue)
      ) {
        acc[rangeNames[0]] = rawValue[0]
          ? dayjs(rawValue[0]).format("YYYY-MM-DD")
          : undefined;
        acc[rangeNames[1]] = rawValue[1]
          ? dayjs(rawValue[1]).format("YYYY-MM-DD")
          : undefined;
        acc[key] = undefined;
        return acc;
      }

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
