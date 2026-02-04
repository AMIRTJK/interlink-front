import { ReactNode } from "react";

export interface ITabItem {
  key: string;
  label: ReactNode;
}

export interface ITabsProps {
  items: ITabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  layoutId?: string;
}