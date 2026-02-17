import { motion } from "framer-motion";
import { TMenuItem } from "@shared/lib/hooks";

interface IIosVariantProps {
  menuItems: TMenuItem[];
  subItems?: TMenuItem[];
  activeKey: string;
  handleNavigate: (path: string) => void;
  pathname: string;
}

export const IosVariant = ({
  menuItems,
  subItems,
  activeKey,
  handleNavigate,
  pathname,
}: IIosVariantProps) => {
  return (
    <div className="ios-dock-wrapper">
      <div className="ios-dock-group">
        {/* Sub Menu (Segmented Control) */}
        {subItems && subItems.length > 0 && (
          <motion.div
            className="ios-sub-dock-container"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {subItems.map((sub) => {
              if (!sub || !("key" in sub)) return null;
              const subKey = String(sub.key);
              const isActive = pathname === subKey || pathname.startsWith(subKey + "/");

              return (
                <motion.div
                  key={subKey}
                  className={`ios-sub-dock-item ${isActive ? "active" : ""}`}
                  onClick={() => handleNavigate(subKey)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="iosSubDockActive"
                      className="ios-sub-active-bg"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <div className="ios-sub-icon-wrapper">
                    {"icon" in sub && sub.icon}
                  </div>
                  <span className="ios-sub-label">
                    {"label" in sub ? sub.label : ""}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Main Dock */}
        <div className="ios-dock-container">
          {menuItems.map((item) => {
            if (!item || !("key" in item)) return null;
            const itemKey = String(item.key);
            const isActive = activeKey === itemKey;

            return (
              <motion.div
                key={itemKey}
                className={`ios-dock-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavigate(itemKey)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="iosDockActive"
                    className="ios-active-pill"
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                <div className="ios-icon-wrapper">
                  {"icon" in item && item.icon}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
