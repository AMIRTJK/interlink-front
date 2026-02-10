import React from "react";
import { MenuItem } from "../model";
import { FolderTreeItem } from "./FolderTreeItem";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import folderIcon from "../../../assets/icons/folder.svg?raw";
import { FolderActions } from "./FolderActions";

interface IFolderViewContentProps {
  folder: MenuItem;
  onClose: () => void;
}

export const FolderViewContent: React.FC<IFolderViewContentProps> = ({ folder, onClose }) => {
  const children = folder.children || [];
  const createItem = children.find((c: MenuItem) => c.folderName === "Создать новую папку");
  const displayItems = children.filter((c: MenuItem) => c.folderName !== "Создать новую папку");
  const isEmpty = displayItems.length === 0;

  return (
    <div className="relative pointer-events-auto">
        <div className="absolute -top-10 left-0 w-32 h-12 bg-[#FFD700] rounded-t-2xl z-0" />
        <div className="bg-[#FFD700] p-3 rounded-2xl rounded-tl-none shadow-2xl relative z-10 min-h-[500px] flex flex-col">
            <div className="bg-[#FFFFF0] flex-1 rounded-xl p-6 flex flex-col shadow-inner items-stretch">
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
  );
};
