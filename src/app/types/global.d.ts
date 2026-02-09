import { ReactNode } from "react";

declare global {
  interface IResponse<T> {
    items: T[];
    total: number;
  }

  interface ISelectOption<T = any> {
    label: ReactNode | string;
    value: string | number;
    data?: T;
  }

  interface IModalState {
    open?: boolean;
    onClose?: () => void;
  }

  type Nullable<T> = T | null;

  interface IValueOption {
    id: number;
    value: string;
  }

  interface IOrderBy {
    orderColumn: number;
    direction: number;
  }

  interface IPageInfo {
    pageNumber: number;
    pageSize: number;
  }
}

export {};
