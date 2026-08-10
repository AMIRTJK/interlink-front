import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  LayoutGrid,
  List,
  TrendingUp,
  Filter,
  Activity,
} from "lucide-react";
import { Count, If } from "@shared/ui";
import { RippleEffect } from "./RippleEffect";
import type { ViewMode } from "./registryLayoutModel";

interface IProps {
  createButtonText?: string;
  totalRecords: number;
  showFrom?: number;
  showTo?: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  hasActiveFilters: boolean;
  onOpenFilters: () => void;
  ripples: Array<{ id: number; x: number; y: number }>;
  onCreateClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isStatusNavActive: boolean;
  tabs: any[];
  activeTabId: string;
  onTabChange: (id: string) => void;
}

export const RegistryHeaderBar = ({
  createButtonText,
  totalRecords,
  showFrom,
  showTo,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onOpenFilters,
  ripples,
  onCreateClick,
  isStatusNavActive,
  tabs,
  activeTabId,
  onTabChange,
}: IProps) => (
  <motion.div
    className="ui-glass bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-3 space-y-3 shrink-0 m-0"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between gap-3">
      {createButtonText && (
        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={onCreateClick}
          className="relative cursor-pointer flex items-center gap-2 px-6 py-2 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-sm shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
        >
          <AnimatePresence>
            {ripples.map((ripple) => (
              <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} />
            ))}
          </AnimatePresence>
          <Plus className="w-4 h-4 relative z-10" />
          <span className="relative z-10">{createButtonText}</span>
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut",
            }}
          />
        </motion.button>
      )}

      <div className="flex items-center gap-2">
        <div className="ui-glass-soft flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300 px-3 py-1.5 bg-gray-50 dark:bg-slate-700/50 rounded-full border border-gray-100 dark:border-slate-700 select-none">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-medium">
            Всего:{" "}
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {totalRecords}
            </span>
          </span>
          {Boolean(showFrom && showTo && totalRecords > 0) && (
            <>
              <span className="text-gray-300 dark:text-slate-600">·</span>
              <span className="text-gray-500 dark:text-slate-400 font-medium">
                Показано: <span className="font-semibold text-gray-700 dark:text-slate-200">{showFrom}-{showTo}</span>
              </span>
            </>
          )}
        </div>

        <div className="ui-glass-soft flex items-center gap-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg p-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange("list")}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === "list"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
            }`}
          >
            <List size={16} />
            <span>Список</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange("block")}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === "block"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
            }`}
          >
            <LayoutGrid size={16} />
            <span>Блоки</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewModeChange("structure")}
            className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === "structure"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100"
            }`}
          >
            <Activity size={16} />
            <span>Структура</span>
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenFilters}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
            hasActiveFilters
              ? "bg-blue-600 text-white shadow-md"
              : "ui-glass-soft bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600"
          }`}
        >
          <Filter size={16} />
          <span>Фильтры</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
          )}
        </motion.button>
      </div>
    </div>

    <If is={isStatusNavActive}>
      <div className="flex items-center gap-2 pb-1 scrollbar-hide flex-wrap">
        {tabs?.map((tab, index) => (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-active={activeTabId === tab.id}
            className={`relative group/tab cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap min-w-[108px] ${
              activeTabId === tab.id
                ? "text-white"
                : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
          >
            <If is={activeTabId === tab.id}>
              <motion.div
                layoutId="active-status-bg"
                className={`absolute inset-0 rounded-full bg-linear-to-r ${tab.gradient} shadow-md`}
                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
              />
            </If>
            <span className="relative z-10 flex items-center justify-center">
              <span
                className={`flex items-center justify-center ${
                  activeTabId !== tab.id ? "opacity-70" : ""
                }`}
              >
                {tab.icon}
              </span>
            </span>
            <span className="relative z-10">{tab.label}</span>
            <If is={Boolean(tab.count)}>
              <Count
                count={tab.count}
                animate={false}
                variant="red"
                className="absolute -top-1.5 -right-1.5 shadow-xs transition-colors z-20"
              />
            </If>
          </motion.button>
        ))}
      </div>
    </If>
  </motion.div>
);
