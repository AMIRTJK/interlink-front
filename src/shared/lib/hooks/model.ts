import type { MenuProps } from "antd";

export type TNavbarVariant = "default" | "ios";

// Types for Navigation Tabs
export type TTabMode = "on" | "off";

export interface ITab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
}


export type TMenuItem = Required<MenuProps>["items"][number] & {
  requiredRole?: string[];
  icon?: React.ReactNode;
};

export type TSubMenuItem = {
  key: string;
  label: React.ReactNode;
  children?: TMenuItem[];
  requiredRole?: string[];
  icon?: React.ReactNode;
};
