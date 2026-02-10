import React from "react";
import { MenuItem } from "../model";
import { FolderTreeItem } from "./FolderTreeItem";
import { Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import folderIcon from "../../../assets/icons/folder.svg?raw";
import { FolderActions } from "./FolderActions";

interface IProps {
  folder: MenuItem;
  onClose: () => void;
}

export const FolderViewContent: React.FC<IProps> = ({ folder, onClose }) => {
  const children = folder.children || [];

  const displayItems = children.filter((c: MenuItem) => c.folderName !== "Создать новую папку");
  const isEmpty = displayItems.length === 0;

  return (
    <div className="relative pointer-events-auto">
        <div className="absolute -top-10 left-0 w-32 h-12 bg-[#FFD700] rounded-t-2xl z-0" />
        <div className="bg-[#FFD700] p-3 rounded-2xl rounded-tl-none shadow-2xl relative z-10 min-h-[500px] flex flex-col">
            <div className="bg-[#FFFFF0] flex-1 rounded-xl p-6 flex flex-col shadow-inner items-stretch">
               <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                         <span 
                            className="w-8 h-8 flex items-center justify-center text-[#E6B800] [&_svg]:w-full! [&_svg]:h-full! [&_svg]:text-inherit!"
                            dangerouslySetInnerHTML={{ __html: folderIcon }} 
                         />
                         <span className="text-xl font-bold text-gray-800">
                            {folder.folderName || folder.label}
                         </span>
                    </div>
                    <div className="flex gap-2 items-center">
                         <FolderActions menuActions={folder.menuActions} collapsed={false} />
                         <Button type="text" icon={<CloseOutlined />} onClick={onClose} className="text-gray-400 hover:rotate-90 transition-transform duration-300 hover:bg-black/5" />
                    </div>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                   {isEmpty ? (
                       <div className="h-full flex flex-col items-center justify-center text-gray-400">

                           <p className="text-lg mb-6">Папки отсутствуют</p>

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
