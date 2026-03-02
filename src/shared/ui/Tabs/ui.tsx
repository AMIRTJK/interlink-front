import { motion } from "framer-motion";
import { If } from "../If";
import "./style.css";
import { ITabsProps } from "./model";

export const Tabs = ({
  items,
  activeKey,
  onChange,
  className = "",
  layoutId = "active-tab",
  extraContent,
}: ITabsProps) => {
  return (
    <div className={`ui-tabs flex justify-between items-center w-full ${className}`}>
      <div className="flex w-full">
        {items?.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <motion.button
              key={item.key}
              className={`ui-tab ${isActive ? "ui-tab--active" : ""}`}
              onClick={() => onChange(item.key)}
            >
              <If is={isActive}>
                <motion.div
                  layoutId={layoutId}
                  className="ui-tab-background"
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                />
              </If>
              <span className="ui-tab-text">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
      {extraContent && (
        <div className="ml-auto pr-2 flex items-center">
          {extraContent}
        </div>
      )}
    </div>
  );
};
