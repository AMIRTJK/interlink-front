import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users } from "lucide-react";
import { ORG_STRUCTURE } from "../lib/constants";
import type { OrgStructureNode } from "../types";
import { OrgStructureNodeItem } from "./OrgStructureNodeItem";

export const OrgStructureModal = ({
  onSelect,
  onClose,
}: {
  onSelect: (node: OrgStructureNode) => void;
  onClose: () => void;
}) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[3px]"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 16 }}
      transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
      className="fixed inset-4 z-[101] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Users size={17} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 leading-tight">
              Структура организации
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Выберите исполнителя
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold"
        >
          <X size={14} />
          <span>Закрыть</span>
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-1">
          <OrgStructureNodeItem
            node={ORG_STRUCTURE}
            onSelect={(node) => {
              onSelect(node);
              onClose();
            }}
          />
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
);
