import { InputProps } from "antd";

export enum FilterType {
  INPUT = "input",
  SELECT = "select",
  DATE = "date",
  DATE_RANGE = "date-range",
}

export interface IFilterItem {
  type: FilterType;
  name: string;
  label: string;
  placeholder?: string | [string, string];
  options?: ISelectOption[];
  inputProps?: Partial<InputProps>;
  transform?: (value: any, options?: ISelectOption[]) => any;
  formatValue?: (value: any) => any;
  rangeNames?: [string, string];
}
