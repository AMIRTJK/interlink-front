import { motion, AnimatePresence } from "framer-motion";
import { CloseOutlined, AppstoreOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { useTabs, useNavbar } from "@shared/lib/hooks";
import { useLocation } from "react-router-dom";
import "../style.css";

export const TabNavigation = () => {
  const { tabs, tabMode, removeTab, isTabsCollapsed, setIsTabsCollapsed } = useTabs();
  const { handleNavigate, menuItems, subItems } = useNavbar();
  const { pathname } = useLocation();

  if (tabMode === "off" || tabs.length === 0) {
    return null;
  }

  return (
    <div className="tab-navigation-wrapper">
      <AnimatePresence mode="wait">
        {!isTabsCollapsed ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="tab-navigation-container flex items-center" 
          >
            {/* Обертка для вкладок */}
            <div className="flex bg-transparent">
              <AnimatePresence mode="popLayout">
                {tabs.map((tab) => {
                  const isActive = pathname === tab.path || pathname.startsWith(tab.path + "/");
                  const allItems = [...(menuItems || []), ...(subItems || [])];
                  const originItem = allItems.find(x => String(x?.key) === tab.key);
                  const displayIcon = tab.icon || originItem?.icon;
                  
                  return (
                    <motion.div
                      key={tab.key}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`tab-item ${isActive ? "active" : ""}`}
                      onClick={() => handleNavigate(tab.path)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabBackgroundIndependent"
                          className="active-tab-bg"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      {displayIcon && <div className="tab-icon">{displayIcon}</div>}
                      <Tooltip title={tab.label} placement="top" mouseEnterDelay={0.5}>
                        <span className="tab-label">{tab.label}</span>
                      </Tooltip>
                      
                      <Tooltip title="Закрыть вкладку" placement="top" mouseEnterDelay={0.4}>
                        <button
                          className="tab-close-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeTab(tab.key, { pathname });
                          }}
                        >
                          <CloseOutlined style={{ fontSize: 10 }} />
                        </button>
                      </Tooltip>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Кнопка скрыть */}
            <Tooltip title="Скрыть панель" placement="topRight">
              <div className="flex items-center ml-1 pr-1">
                 <motion.button
                   onClick={() => setIsTabsCollapsed(true)}
                   whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                   whileTap={{ scale: 0.95 }}
                   className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                 >
                   <CloseOutlined style={{ fontSize: 13 }} />
                 </motion.button>
              </div>
            </Tooltip>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="cursor-pointer pointer-events-auto"
            onClick={() => setIsTabsCollapsed(false)}
          >
             <Tooltip title="Развернуть вкладки" placement="top" mouseEnterDelay={0.3}>
               <div className="subtle-glass bg-indigo-500/80! hover:bg-indigo-600/90! backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-colors border border-indigo-400/30">
                  <AppstoreOutlined className="text-white text-lg" />
                  <span className="text-white font-medium text-sm">Вкладки ({tabs.length})</span>
               </div>
             </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

