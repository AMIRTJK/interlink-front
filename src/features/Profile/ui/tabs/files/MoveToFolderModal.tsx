import React, { useState, useEffect } from "react";
import { Modal, Select } from "antd";
import { IApiFolder } from "./lib";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  folders: IApiFolder[];
  currentFolderId: number | null;
  onConfirm: (targetFolderId: number | null) => void;
  fileName: string;
}

export const MoveToFolderModal = ({
  isOpen,
  onClose,
  folders,
  currentFolderId,
  onConfirm,
  fileName,
}: IProps) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>("root");

  useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(currentFolderId === null ? "root" : String(currentFolderId));
    }
  }, [isOpen, currentFolderId]);

  const handleConfirm = () => {
    const val = selectedFolderId === "root" ? null : Number(selectedFolderId);
    onConfirm(val);
    onClose();
  };

  // Build option list
  const options = [
    { value: "root", label: "📁 Корневой каталог (Все файлы)" },
    ...folders.map((f) => ({
      value: String(f.id),
      label: `📁 ${f.name}`,
    })),
  ];

  return (
    <Modal
      title={
        <span className="text-base font-bold text-slate-800 dark:text-zinc-100">
          Переместить файл
        </span>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={handleConfirm}
      okButtonProps={{
        className: "bg-indigo-600! hover:bg-indigo-700! text-white! rounded-full px-5",
      }}
      cancelButtonProps={{
        className: "rounded-full px-5 border-slate-200 dark:border-slate-800",
      }}
      destroyOnClose
    >
      <div className="py-4 space-y-4">
        <div>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider">
            Файл для перемещения
          </p>
          <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 truncate mt-1">
            {fileName}
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-2">
            Выберите целевую папку
          </label>
          <Select
            value={selectedFolderId}
            onChange={setSelectedFolderId}
            options={options}
            className="w-full rounded-xl border-slate-200 dark:border-slate-850 h-10"
            dropdownClassName="dark:bg-slate-800"
          />
        </div>
      </div>
    </Modal>
  );
};
