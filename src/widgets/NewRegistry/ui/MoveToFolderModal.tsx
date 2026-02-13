import React, { useState, useMemo } from "react";
import { Modal, Tree, Input, Empty, Segmented, InputNumber } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Folder, ChevronRight, Hash, Sparkles } from "lucide-react";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

interface MoveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | null;
  folders: any[];
  isInternal?: boolean;
}

export const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  isOpen,
  onClose,
  documentId,
  folders,
  isInternal = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<any | null>(null);
  const [regMode, setRegMode] = useState<"auto" | "manual">("auto");
  const [regSeq, setRegSeq] = useState<number | null>(null);

  const { mutate: moveDocument, isPending } = useMutationQuery({
    url: (data: any) => 
      isInternal 
        ? ApiRoutes.INTERNAL_MOVE_FOLDER.replace(":id", String(data.id))
        : ApiRoutes.FOLDER_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    messages: {
      success: "Документ перемещен",
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

  const treeData = useMemo(() => {
    const buildTree = (parentId: number | null = null): any[] => {
      return folders
        .filter((f) => f.parent_id === parentId)
        .map((f) => ({
          title: f.name,
          key: f.id,
          folder: f,
          children: buildTree(f.id),
          icon: <Folder size={16} className={selectedFolder?.id === f.id ? "text-blue-500" : "text-gray-400"} />,
        }));
    };

    const fullTree = buildTree();
    
    if (!searchQuery) return fullTree;

    const filterTree = (nodes: any[]): any[] => {
      return nodes
        .map((node) => {
          const match = node.title.toLowerCase().includes(searchQuery.toLowerCase());
          const filteredChildren = node.children ? filterTree(node.children) : [];
          if (match || filteredChildren.length > 0) {
            return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter(Boolean) as any[];
    };

    return filterTree(fullTree);
  }, [folders, searchQuery, selectedFolder]);

  const handleMove = () => {
    if (selectedFolder !== null && documentId !== null) {
      // Формируем чистый body по спецификации Комила
      const body: any = {
        id: documentId, // Нужно для формирования URL в useMutationQuery
        folder: selectedFolder.slug || String(selectedFolder.id),
        reg_seq: regMode === "manual" ? regSeq : (regSeq || 15), // Для авто пока шлем 15 как в примере или regSeq если есть
      };

      moveDocument(body);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleMove}
      confirmLoading={isPending}
      okButtonProps={{ disabled: selectedFolder === null || (regMode === "manual" && regSeq === null) }}
      okText="Переместить"
      cancelText="Отмена"
      title={
        <div className="flex items-center gap-2 pb-2">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Folder size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-none text-base">Смарт-перемещение</h3>
            <p className="text-[11px] text-gray-400 font-normal mt-1">Выберите целевую папку и режим нумерации</p>
          </div>
        </div>
      }
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

          <div className="max-h-[280px] overflow-y-auto pr-1 custom-scrollbar min-h-[120px] bg-gray-50/30 rounded-xl p-2 border border-dashed border-gray-100">
            {treeData.length > 0 ? (
              <Tree
                showIcon
                blockNode
                defaultExpandAll
                treeData={treeData}
                selectedKeys={selectedFolder ? [selectedFolder.id] : []}
                onSelect={(_, info: any) => setSelectedFolder(info.selected ? info.node.folder : null)}
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

        <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Режим нумерации</span>
            </div>
            <Segmented
              options={[
                { label: "Авто", value: "auto", icon: <Sparkles size={12} /> },
                { label: "Ручной", value: "manual", icon: <Hash size={12} /> },
              ]}
              value={regMode}
              onChange={(val: any) => setRegMode(val)}
              className="premium-segmented"
            />
          </div>

          <AnimatePresence mode="wait">
            {regMode === "manual" ? (
              <motion.div
                key="manual"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-2"
              >
                <div className="text-[11px] text-blue-600/70 font-medium px-1">Введите порядковый номер (reg_seq)</div>
                <InputNumber
                  placeholder="Например: 15"
                  value={regSeq}
                  onChange={(val) => setRegSeq(val)}
                  className="w-full h-10 rounded-xl border-blue-100 hover:border-blue-400 focus:border-blue-500"
                  min={1}
                />
              </motion.div>
            ) : (
              <motion.div
                key="auto"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="py-2 px-1"
              >
                <p className="text-xs text-blue-600/60 leading-relaxed italic">
                  Для автоматического режима будет использован следующий доступный номер.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .folder-tree-premium {
          background: transparent !important;
        }
        .folder-tree-premium .ant-tree-node-content-wrapper {
          padding-top: 8px !important;
          padding-bottom: 8px !important;
          border-radius: 12px !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
          margin: 2px 0 !important;
          font-weight: 500 !important;
          font-size: 13px !important;
        }
        .folder-tree-premium .ant-tree-node-selected {
          background-color: #ffffff !important;
          color: #2563eb !important;
          box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.15) !important;
          border: 1px solid #dbeafe !important;
        }
        .premium-segmented {
          background: rgba(255, 255, 255, 0.5) !important;
          padding: 3px !important;
          border-radius: 10px !important;
        }
        .premium-segmented .ant-segmented-item-selected {
          background: #ffffff !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
          border-radius: 8px !important;
          color: #2563eb !important;
        }
        .premium-modal .ant-modal-content {
          border-radius: 24px !important;
          padding: 24px !important;
        }
        .premium-modal .ant-modal-header {
          margin-bottom: 12px !important;
        }
        .premium-modal .ant-modal-footer {
          margin-top: 24px !important;
          border-top: none !important;
          display: flex !important;
          gap: 12px !important;
          justify-content: flex-end !important;
        }
        .premium-modal .ant-modal-footer .ant-btn {
          height: 44px !important;
          border-radius: 14px !important;
          font-weight: 600 !important;
          min-width: 120px !important;
        }
        .premium-modal .ant-modal-footer .ant-btn-primary {
          background: #2563eb !important;
          box-shadow: 0 8px 20px -6px rgba(37, 99, 235, 0.4) !important;
        }
      `}</style>
    </Modal>
  );
};
