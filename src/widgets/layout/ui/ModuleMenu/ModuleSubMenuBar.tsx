import { motion, AnimatePresence } from "framer-motion";
import type { MenuItem } from "./lib";
import { AppRoutes } from "@shared/config/AppRoutes";
import {
  SHARED_ROUTES,
  STORAGE_KEY,
  CONTAINER_VARIANTS,
  ITEM_VARIANTS,
  CONTENT_VARIANTS,
} from "./moduleMenuModel";

interface ISubMenuBarProps {
  variant: string;
  activeKey: string;
  subItems?: MenuItem[];
  pathname: string;
  onNavigate: (path: string) => void;
}

export const ModuleSubMenuBar = ({
  variant,
  activeKey,
  subItems,
  pathname,
  onNavigate,
}: ISubMenuBarProps) => {
  return (
    <AnimatePresence mode="wait">
      {(variant === "compact" || variant === "modern") &&
        subItems &&
        activeKey !== AppRoutes.HR && (
          <motion.div
            key={activeKey}
            className="sub-menu-bar"
            variants={CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {subItems?.map((sub) => {
              if (!sub || !("key" in sub)) return null;

              const subKey = String(sub.key);

              const isDirectMatch =
                pathname === subKey || pathname.startsWith(subKey + "/");

              const isRestoredMatch = (() => {
                const isSharedRoute = SHARED_ROUTES.some((route) =>
                  pathname.includes(route),
                );
                if (isSharedRoute) {
                  const lastActiveKey = sessionStorage.getItem(STORAGE_KEY);
                  return lastActiveKey === subKey;
                }
                return false;
              })();

              const isActive = isDirectMatch || isRestoredMatch;

              return (
                <motion.div
                  key={sub.key}
                  className={`sub-menu-item ${isActive ? "active" : ""} `}
                  onClick={() => onNavigate(sub.key as string)}
                  variants={ITEM_VARIANTS}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ position: "relative" }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeBorder"
                      className="active-border"
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25,
                      }}
                    />
                  )}
                  {variant === "modern" && "icon" in sub && (
                    <motion.span
                      variants={CONTENT_VARIANTS}
                      className="flex items-center"
                    >
                      {sub.icon}
                    </motion.span>
                  )}
                  <motion.span variants={CONTENT_VARIANTS}>
                    {"label" in sub ? sub.label : ""}
                  </motion.span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
    </AnimatePresence>
  );
};
