import React, { useState, useEffect } from "react";
import { Modal, Input } from "antd";
import { EmojiPicker } from "./EmojiPicker";
import { If } from "@shared/ui";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, emoji: string | null) => void;
  initialName?: string;
  initialEmoji?: string | null;
  title: string;
}

export const FolderActionsModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialName = "",
  initialEmoji = null,
  title,
}: IProps) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setEmoji(initialEmoji);
    }
  }, [isOpen, initialName, initialEmoji]);

  const handleOk = () => {
    if (name.trim()) {
      onSubmit(name.trim(), emoji);
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
        style: { display: "none" },
      }}
      className="dark:bg-slate-900"
      destroyOnClose
    >
      <div className="py-4 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400">
              Иконка папки
            </label>
            <If is={emoji !== null}>
              <span className="text-lg ml-1">{emoji}</span>
              <button
                type="button"
                onClick={() => setEmoji(null)}
                className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer underline ml-1"
              >
                Сбросить
              </button>
            </If>
          </div>
          <EmojiPicker
            selectedEmoji={emoji ?? ""}
            onSelectEmoji={setEmoji}
          />
        </div>

        <div>
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
      </div>
    </Modal>
  );
};
