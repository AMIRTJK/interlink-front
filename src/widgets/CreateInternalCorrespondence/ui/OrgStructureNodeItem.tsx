import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { OrgStructureNode } from "../types";
import { cn } from "../lib/utils";

export const OrgStructureNodeItem = ({
  node,
  depth = 0,
  onSelect,
}: {
  node: OrgStructureNode;
  depth?: number;
  onSelect: (node: OrgStructureNode) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = !!(node.children && node.children.length > 0);
  const isLeaf = !hasChildren;
  return (
    <div key={node.id}>
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => {
          if (isLeaf) onSelect(node);
          if (hasChildren) setIsExpanded(!isExpanded);
        }}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left",
          isLeaf
            ? "hover:bg-blue-50 cursor-pointer border border-slate-200"
            : "hover:bg-slate-50",
        )}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center justify-center w-5 h-5 flex-shrink-0"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={14} className="text-slate-400" />
            </motion.div>
          </button>
        )}
        {isLeaf && <div className="w-5 flex-shrink-0" />}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
            node.color,
          )}
        >
          {node.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {node.name}
          </p>
          <p className="text-[11px] text-slate-500 truncate">{node.position}</p>
        </div>
      </motion.button>
      {hasChildren && isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="space-y-1">
            {node.children!.map((child) => (
              <OrgStructureNodeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                onSelect={onSelect}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
