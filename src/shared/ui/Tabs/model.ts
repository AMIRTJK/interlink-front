export interface ITabItem {
  key: string;
  label: string;
}

export interface ITabsProps {
  items: ITabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  layoutId?: string;
}