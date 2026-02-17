import type { MenuProps } from "antd";

export type TNavbarVariant = "default" | "ios";

export type TMenuItem = Required<MenuProps>["items"][number] & {
  requiredRole?: string[];
};

export type TSubMenuItem = {
  key: string;
  label: React.ReactNode;
  children?: TMenuItem[];
  requiredRole?: string[];
  icon?: React.ReactNode;
};
