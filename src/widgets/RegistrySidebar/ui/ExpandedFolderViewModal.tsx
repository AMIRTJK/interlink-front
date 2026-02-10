import React, { useState } from "react";
import { Modal, Button } from "antd";
import { MenuItem } from "../model";
import { motion, AnimatePresence } from "framer-motion";
import folderIcon from "../../../assets/icons/folder.svg?raw";
import sidebarArrow from '../../../assets/icons/sidebarArrow.svg?raw'
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { cn } from "@shared/lib/utils";
import { FolderActions } from "../lib/FolderActions";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  folder: MenuItem;
}

// Recursive component for the tree view inside the modal
const FolderTreeItem: React.FC<{ item: MenuItem; depth?: number }> = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isCreatePlaceholder = item.folderName === "Создать новую папку";

  const toggleOpen = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.stopPropagation();
      setIsOpen(!isOpen);
    }
  };

  // Card-like styling for the row
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
                {/* Header: Icon + Info */}
                <div className="flex items-center gap-2 w-full">
                     {/* Icon */}
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

                    {/* Text Content */}
                    <div className="flex flex-col flex-1 min-w-0 leading-tight">
                         <span className="text-sm font-bold text-gray-800 truncate" title={item.folderName || item.label}>
                            {item.folderName || item.label}
                         </span>
                         <span className="text-[10px] text-gray-400">
                            № {item.count || item.key?.split('-').pop() || '0'}
                         </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-yellow-200/50 w-full my-0.5" />

                {/* Footer: Actions + Arrow (Right Aligned) */}
                <div className="flex items-center justify-end gap-1 h-6" onClick={(e) => e.stopPropagation()}>
                    <div className="scale-75 origin-right">
                        <FolderActions menuActions={item.menuActions} collapsed={false} />
                    </div>
                    
                    {/* Expansion Arrow */}
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

      {/* Children Grid */}
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
             {/* Render children in a Grid, indented */}
             <div 
                className={cn(
                    "mt-2 pl-4 border-l border-dotted ml-5 pb-2 pr-1",
                    // Cycle through nice colors based on depth
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

export const ExpandedFolderViewModal: React.FC<IProps> = ({
  isOpen,
  onClose,
  folder,
}) => {
  const children = folder.children || [];
  const createItem = children.find((c: MenuItem) => c.folderName === "Создать новую папку");
  // We want to show everything in the tree, including the 'Create' item at the end of the root list if it exists.
  // Actually, standard children array usually already includes it if we built it that way.
  // If we filter it out, we should re-append it.
  
  // Let's use the children as is, assuming buildMenuTree handles the placeholder structure.
  // However, buildMenuTree adds placeholder to *folder.children*.
  
  // Filter out create item for display list, as requested to move it to header actions
  const displayItems = children.filter((c: MenuItem) => c.folderName !== "Создать новую папку");
  const isEmpty = displayItems.length === 0;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={900}
      modalRender={() => (
        <div className="relative pointer-events-auto">
            {/* Tab */}
            <div className="absolute -top-10 left-0 w-32 h-12 bg-[#FFD700] rounded-t-2xl z-0" />
            
            {/* Main Folder Body */}
            <div className="bg-[#FFD700] p-3 rounded-2xl rounded-tl-none shadow-2xl relative z-10 min-h-[500px] flex flex-col">
                {/* White Content Card */}
                <div className="bg-[#FFFFF0] flex-1 rounded-xl p-6 flex flex-col shadow-inner items-stretch">
                   
                   {/* Header */}
                   <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                             <span 
                                className="w-8 h-8 text-[#E6B800]"
                                dangerouslySetInnerHTML={{ __html: folderIcon }} 
                             />
                             <span className="text-xl font-bold text-gray-800">
                                {folder.folderName || folder.label}
                             </span>
                        </div>
                        <div className="flex gap-2 items-center">
                             <FolderActions menuActions={folder.menuActions} collapsed={false} />
                             <Button type="text" icon={<CloseOutlined />} onClick={onClose} className="text-gray-400" />
                        </div>
                   </div>

                   {/* Content */}
                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                       {isEmpty ? (
                           <div className="h-full flex flex-col items-center justify-center text-gray-400">
                               <div className="w-24 h-24 mb-4 text-[#FDE047] opacity-60 bg-yellow-100 rounded-3xl flex items-center justify-center">
                                    <span 
                                        className="w-12 h-12 text-[#E6B800]"
                                        dangerouslySetInnerHTML={{ __html: folderIcon }} 
                                    />
                               </div>
                               <p className="text-lg mb-6">Папки отсутствуют</p>
                               {createItem && (
                                   <Button 
                                      type="primary" 
                                      className="bg-[#00C853] hover:bg-[#00BFA5] border-none px-6 h-10 rounded-full font-medium shadow-lg shadow-green-200"
                                      onClick={(e) => {
                                          createItem.onTitleClick?.(e);
                                      }}
                                   >
                                      + Создать папку
                                   </Button>
                               )}
                           </div>
                       ) : (
                           <div className="grid grid-cols-3 gap-4">
                               {displayItems.map((item: MenuItem) => (
                                   <FolderTreeItem key={item.key} item={item} />
                               ))}
                           </div>
                       )}
                   </div>

                </div>
            </div>
        </div>
      )}
    />
  );
};
