import React, { useState, useEffect } from "react";
import { Modal, Input } from "antd";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialName?: string;
  title: string;
}

export const FolderActionsModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialName = "",
  title,
}: IProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
    }
  }, [isOpen, initialName]);

  const handleOk = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      onClose();
    }
  };

  return (
    <Modal
      title={
        <span className="text-base font-bold text-slate-800 dark:text-zinc-100">
          {title}
        </span>
      }
      open={isOpen}
      onCancel={onClose}
      onOk={handleOk}
      okButtonProps={{
        disabled: !name.trim(),
        className: "bg-indigo-600! hover:bg-indigo-700! text-white! rounded-full px-5",
      }}
      cancelButtonProps={{
        className: "rounded-full px-5 border-slate-200 dark:border-slate-800",
      }}
      className="dark:bg-slate-900"
      destroyOnClose
    >
      <div className="py-4">
        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-2">
          Название папки
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите название..."
          onPressEnter={handleOk}
          autoFocus
          className="rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-zinc-100"
        />
      </div>
    </Modal>
  );
};
