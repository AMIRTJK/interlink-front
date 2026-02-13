
import React, { useState } from "react";
import { Modal, Tree, Input, Empty } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Folder, FolderOpen, ChevronRight } from "lucide-react";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IFolder, IMoveToFolderModalProps } from "../model";
import { useFolderTree, TFolderTreeNode } from "../lib/useFolderTree";

/**
 * Модальное окно для перемещения документа в папку
 * Реализовано согласно правилам GEMINI.md:
 * - Русский язык (правила 2, 3, 4)
 * - Декомпозиция (правило 37)
 * - Типизация (правило 26)
 * - FSD архитектура
 */
export const MoveToFolderModal: React.FC<IMoveToFolderModalProps> = ({
  isOpen,
  onClose,
  documentId,
  folders,
  isInternal = true,
}) => {
  // --- Состояние ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<IFolder | null>(null);

  // --- Логика сервера ---
  const { mutate: moveDocument, isPending } = useMutationQuery({
    url: (data: { id: number | string; folder: string; reg_seq: number | null }) => 
      isInternal 
        ? ApiRoutes.INTERNAL_MOVE_FOLDER.replace(":id", String(data.id))
        : ApiRoutes.FOLDER_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    messages: {
      success: "Документ успешно перемещен",
      invalidate: [
        ApiRoutes.GET_CORRESPONDENCES, 
        ApiRoutes.GET_INTERNAL_COUNTERS, 
        ApiRoutes.GET_INTERNAL_INCOMING,
        ApiRoutes.GET_INTERNAL_OUTGOING,
        ApiRoutes.GET_INTERNAL_DRAFTS
      ],
      onSuccessCb: () => onClose(),
    },
  });

  // --- Подготовка дерева данных (хук) ---
  const treeData = useFolderTree(folders, searchQuery);

  // --- Обработчики ---
  const handleMove = () => {
    if (selectedFolder && documentId !== null) {
      moveDocument({
        id: documentId,
        folder: selectedFolder.slug || String(selectedFolder.id),
        reg_seq: null, // Автоматический режим — сервер сам назначит номер
      });
    }
  };

  // --- Динамический рендер иконок ---
  const renderFolderIcon = (props: { key?: string | number; expanded?: boolean }) => {
    const isSelected = selectedFolder?.id === Number(props.key);
    const Icon = props.expanded ? FolderOpen : Folder;
    
    return (
      <Icon 
        size={16} 
        className={`${isSelected ? "text-blue-500" : "text-gray-400"} transition-colors duration-200`} 
      />
    );
  };

  // --- Вспомогательные рендеры (правило 37) ---
  const renderHeader = () => (
    <div className="flex items-center gap-2 pb-2">
      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
        <Folder size={20} />
      </div>
      <div>
        <h3 className="font-bold text-gray-900 leading-none text-base">Смарт-перемещение</h3>
        <p className="text-[11px] text-gray-400 font-normal mt-1">Выберите целевую папку для перемещения документа</p>
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleMove}
      confirmLoading={isPending}
      okButtonProps={{ disabled: !selectedFolder }}
      okText="Переместить"
      cancelText="Отмена"
      title={renderHeader()}
      centered
      width={460}
      className="premium-modal"
      modalRender={(modal) => (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
            >
              {modal}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    >
      <div className="space-y-5 pt-3">
        {/* Поиск и дерево папок */}
        <div className="space-y-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <Input
              placeholder="Поиск целевой папки..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-gray-50/50 border-gray-100 hover:border-blue-200 focus:border-blue-500 transition-all rounded-xl"
              allowClear
            />
          </div>

          <div className="max-h-[350px] overflow-y-auto pr-1 custom-scrollbar min-h-[120px] bg-gray-50/30 rounded-xl p-2 border border-dashed border-gray-100">
            {treeData.length > 0 ? (
              <Tree
                showIcon
                showLine={{ showLeafIcon: false }}
                blockNode
                defaultExpandAll
                treeData={treeData}
                icon={renderFolderIcon}
                selectedKeys={selectedFolder ? [selectedFolder.id] : []}
                onSelect={(_, info) => {
                  const node = info.node as unknown as TFolderTreeNode;
                  setSelectedFolder(info.selected ? node.folder : null);
                }}
                switcherIcon={<ChevronRight size={14} className="text-gray-400" />}
                className="folder-tree-premium"
              />
            ) : (
              <div className="py-8">
                <Empty description={<span className="text-gray-400 text-xs">Папки не найдены</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
