import { Menu } from "antd";
import { AppRoutes } from "@shared/config/AppRoutes";
import { IosVariant } from "./IosVariant";
import { IProps } from "./moduleMenuModel";
import { ModuleMenuHeader } from "./ModuleMenuHeader";
import { ModuleSubMenuBar } from "./ModuleSubMenuBar";
import { ModuleCustomMenu } from "./ModuleCustomMenu";
import { useModuleMenuState } from "./useModuleMenuState";
import "./style.css";

export const ModuleMenu = ({
  variant,
  hideTopLevel,
  navLayout = "top",
  collapsed,
}: IProps) => {
  const {
    pathname,
    menuItems,
    activeKey,
    subItems,
    handleNavigate,
  } = useModuleMenuState(variant);

  if (variant === "header") {
    return (
      <ModuleMenuHeader
        menuItems={menuItems}
        pathname={pathname}
        navLayout={navLayout}
        collapsed={collapsed}
        onNavigate={handleNavigate}
      />
    );
  }

  const hasSubMenu =
    (variant === "compact" || variant === "modern") &&
    !!subItems &&
    activeKey !== AppRoutes.HR;

  if (hideTopLevel && !hasSubMenu) {
    return null;
  }

  return (
    <div className={`menu-container ${variant}-mode`}>
      {hideTopLevel ? null : variant === "horizontal" || variant === "full" ? (
        <Menu
          onClick={(e) => handleNavigate(e.key)}
          selectedKeys={[activeKey]}
          mode="horizontal"
          items={menuItems}
          theme="light"
          disabledOverflow
          className="flex-wrap p-2 border-b-0! full-style"
        />
      ) : variant === "ios" ? (
        <IosVariant
          items={menuItems}
          activeKey={activeKey}
          handleNavigate={handleNavigate}
          subItems={subItems}
          pathname={pathname}
        />
      ) : (
        <ModuleCustomMenu
          variant={variant}
          menuItems={menuItems}
          activeKey={activeKey}
          onNavigate={handleNavigate}
        />
      )}

      <ModuleSubMenuBar
        variant={variant}
        activeKey={activeKey}
        subItems={subItems}
        pathname={pathname}
        onNavigate={handleNavigate}
      />
    </div>
  );
};
