import { motion, AnimatePresence } from "framer-motion";
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
        <AnimatePresence>
          {subItems && subItems.length > 0 && (
            <motion.div
              key="submenu"
              className="ios-sub-dock-container backdrop-blur-xl bg-white/80 border border-white/40 shadow-2xl shadow-black/5"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
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
        </AnimatePresence>

        {/* Основное меню */}
        <div className="ios-dock-container backdrop-blur-2xl bg-white/75 border border-white/30 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] rounded-full px-2 pb-2">
          {menuItems.map((item) => {
            if (!item || !("key" in item)) return null;
            const itemKey = String(item.key);
            const isActive = activeKey === itemKey;

            return (
              <motion.div
                key={itemKey}
                className={`ios-dock-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavigate(itemKey)}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="iosDockActive"
                    className="ios-active-pill bg-white shadow-sm"
                    transition={{
                      type: "spring",
                      stiffness: 400,
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
