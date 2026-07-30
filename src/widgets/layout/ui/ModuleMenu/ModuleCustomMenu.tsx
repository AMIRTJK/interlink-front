import { motion } from "framer-motion";
import type { MenuItem } from "./lib";

interface ICustomMenuProps {
  variant: string;
  menuItems: MenuItem[];
  activeKey: string;
  onNavigate: (path: string) => void;
}

export const ModuleCustomMenu = ({
  variant,
  menuItems,
  activeKey,
  onNavigate,
}: ICustomMenuProps) => {
  return (
    <div className={`custom-main-menu ${variant}-style`}>
      {menuItems.map((item) => {
        if (!item || !("key" in item)) return null;
        const itemKey = String(item.key);
        const isActive = activeKey === itemKey;

        return (
          <div
            key={itemKey}
            className={`custom-menu-item ${isActive ? "selected" : ""}`}
            onClick={() => onNavigate(itemKey)}
          >
            {isActive && (
              <motion.div
                layoutId="mainActiveIndicator"
                className="main-active-indicator"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}
            <span className="custom-menu-title">
              {"label" in item ? item.label : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};
