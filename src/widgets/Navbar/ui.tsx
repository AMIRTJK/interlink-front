import { motion, AnimatePresence } from "framer-motion";
import { useNavbar } from "@shared/lib/hooks";
import { IosVariant } from "./lib/IosVariant";
import { NavbarHeader } from "./lib/renderJSX";
import "./style.css";

export const Navbar = () => {
  const { variant, menuItems, subItems, activeKey, handleNavigate, pathname } = useNavbar();

  if (variant === "ios") {
    return (
      <>
        <NavbarHeader isModulesPage={true} />
        <IosVariant 
          menuItems={menuItems}
          subItems={subItems}
          activeKey={activeKey}
          handleNavigate={handleNavigate}
          pathname={pathname}
        />
      </>
    );
  }

  // Дефолтный вариант
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const contentVariants = {
    hidden: { y: 5, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      <NavbarHeader isModulesPage={true} />
      <div className={`menu-container modern-mode`}>
        <div className={`custom-main-menu modern-style`}>
          {menuItems.map((item) => {
            if (!item || !("key" in item)) return null;
            const itemKey = String(item.key);
            const isActive = activeKey === itemKey;

            return (
              <div
                key={itemKey}
                className={`custom-menu-item ${isActive ? "selected" : ""}`}
                onClick={() => handleNavigate(itemKey)}
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
        <AnimatePresence mode="wait">
          {subItems && (
            <motion.div
              key={subItems[0]?.key || "empty"}
              className="sub-menu-bar"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {subItems?.map((sub) => {
                if (!sub || !("key" in sub)) return null;

                const subKey = String(sub.key);
                const isActive = pathname === subKey || pathname.startsWith(subKey + "/");

                return (
                  <motion.div
                    key={subKey}
                    className={`sub-menu-item ${isActive ? "active" : ""} `}
                    onClick={() => handleNavigate(subKey)}
                    variants={itemVariants}
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
                    {"icon" in sub && (
                      <motion.span
                        variants={contentVariants}
                        className="flex items-center"
                      >
                        {sub.icon}
                      </motion.span>
                    )}
                    <motion.span variants={contentVariants}>
                      {"label" in sub ? sub.label : ""}
                    </motion.span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
