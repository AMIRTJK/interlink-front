import React, { useState } from "react";
import { MenuItem } from "../model";
import { motion, AnimatePresence } from "framer-motion";
import sidebarArrow from '../../../assets/icons/sidebarArrow.svg?raw'
import { PlusOutlined } from "@ant-design/icons";
import { cn } from "@shared/lib/utils";
import { FolderActions } from "./FolderActions";

interface IFolderTreeItemProps {
  item: MenuItem;
  depth?: number;
}

export const FolderTreeItem: React.FC<IFolderTreeItemProps> = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isCreatePlaceholder = item.folderName === "Создать новую папку";

  const toggleOpen = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  const cardContent = (
      <div 
        className={cn(
             "relative bg-[#FFFBEB] border border-yellow-200 rounded-lg p-2 flex flex-col gap-1 shadow-sm hover:shadow-md hover:bg-yellow-100 transition-all cursor-pointer group w-full",
             isOpen ? "ring-2 ring-yellow-200" : ""
        )}
        onClick={(e) => {
            if (isCreatePlaceholder) {
                item.onTitleClick?.(e);
                return;
            }
             item.onTitleClick?.(e);
        }}
      >
        {isCreatePlaceholder ? (
            <div className="flex flex-col items-center justify-center py-2">
                <div className="w-8 h-8 flex items-center justify-center text-yellow-600 bg-yellow-100 rounded-full mb-1">
                     <PlusOutlined />
                </div>
                <span className="text-xs font-medium text-yellow-700">
                    Создать
                </span>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-2 w-full">
                     <div className="relative shrink-0">
                        <div className="w-8 h-8 text-yellow-600">
                             {typeof item.icon === 'string' ? (
                                <span 
                                className="w-full h-full block [&>svg]:w-full [&>svg]:h-full [&_svg]:!text-yellow-600 [&_svg]:!stroke-yellow-600"
                                dangerouslySetInnerHTML={{ __html: item.icon }}
                                />
                             ) : item.icon}
                        </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 leading-tight">
                         <span className="text-sm font-bold text-gray-800 truncate" title={item.folderName || item.label}>
                            {item.folderName || item.label}
                         </span>
                         <span className="text-[10px] text-gray-400">
                            № {item.count || item.key?.split('-').pop() || '0'}
                         </span>
                    </div>
                </div>
                <div className="h-px bg-yellow-200/50 w-full my-0.5" />
                <div className="flex items-center justify-end gap-1 h-6" onClick={(e) => e.stopPropagation()}>
                    <div className="scale-75 origin-right">
                        <FolderActions menuActions={item.menuActions} collapsed={false} />
                    </div>
                    {hasChildren && (
                        <div 
                             onClick={toggleOpen}
                             className={cn(
                               "w-6 h-6 flex items-center justify-center rounded-full transition-colors cursor-pointer hover:bg-yellow-200/50",
                               isOpen ? "bg-yellow-200/50" : ""
                             )}
                        >
                              <motion.div
                                  animate={{ rotate: isOpen ? 0 : -90 }}
                                  transition={{ duration: 0.2 }}
                                  className="w-3 h-3 text-gray-500"
                                >
                                 <span 
                                   className="flex items-center justify-center w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current"
                                   dangerouslySetInnerHTML={{ __html: sidebarArrow }}
                                 />
                               </motion.div>
                        </div>
                    )}
                </div>
            </>
        )}
      </div>
  );

  return (
    <div className={cn("select-none relative w-full transition-all duration-300", isOpen ? "col-span-3" : "col-span-1")}>
      <div className="py-1">
        {cardContent}
      </div>
      <AnimatePresence>
        {hasChildren && isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { height: 0, opacity: 0 },
              visible: { 
                height: "auto", 
                opacity: 1,
                transition: {
                  height: { duration: 0.3 },
                  opacity: { duration: 0.2 },
                }
              }
            }}
            className="overflow-hidden"
          >
             <div 
                className={cn(
                    "mt-2 pl-4 border-l border-dotted ml-5 pb-2 pr-1",
                    [
                        "border-blue-400",
                        "border-purple-400",
                        "border-pink-400", 
                        "border-orange-400",
                        "border-teal-400",
                        "border-indigo-400"
                    ][depth % 6]
                )}
             >
                <div className="grid grid-cols-3 gap-3">
                    {item.children!.map((child: MenuItem) => (
                        <FolderTreeItem key={child.key} item={child} depth={depth + 1} />
                    ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
