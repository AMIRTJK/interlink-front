import { Menu } from "antd";

import { useNavigate, useLocation } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";

import "./style.css";
import { getModuleItems, MenuItem } from "./lib";

interface IProps {
  variant: "horizontal" | "compact";
}

interface SubMenuItem {
  key: string;
  label: React.ReactNode;
  children?: MenuItem[];
}

export const ModuleMenu = ({ variant }: IProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items = getModuleItems(variant);

  const activeItem = items.find((item) => {
    if (!item || !("key" in item)) return false;
    const itemKey = String(item.key);
    return pathname === itemKey || pathname.startsWith(itemKey + "/");
  }) as SubMenuItem | undefined;

  const activeKey =
    activeItem?.key ||
    (pathname.includes("modules") ? "" : AppRoutes.PROFILE_TASKS);
  const subItems = activeItem?.children;

  const handleNavigate = (path: string) => {
    if (pathname !== path) {
      navigate(path);
    }
  };

  return (
    <div className={`menu-container ${variant}-mode`}>
      <Menu
        onClick={(e) => handleNavigate(e.key)}
        selectedKeys={[activeKey]}
        mode="horizontal"
        items={
          variant === "compact"
            ? items.map((item) => {
              if (item && "children" in item) {
                const { children: _, ...rest } = item as SubMenuItem;
                return rest;
              }
              return item;
            })
            : items
        }
        theme="light"
        disabledOverflow
        className={`flex-wrap p-2 border-b-0! ${variant === "compact" ? "compact-style" : "full-style"
          }`}
      />

      {/* Вторая синяя полоса для подмодулей */}
      {variant === "compact" && (
        <div className="sub-menu-bar">
          {subItems?.map((sub) => {
            if (!sub || !("key" in sub)) return null;

            const isActive =
              pathname === sub.key || pathname.startsWith(sub.key + "/");

            return (
              <div
                key={sub.key}
                className={`sub-menu-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavigate(sub.key as string)}
              >
                {"label" in sub ? sub.label : ""}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
