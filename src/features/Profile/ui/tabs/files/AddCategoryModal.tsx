import React, { useState, useEffect } from "react";
import { X, FolderOpen } from "lucide-react";
import { If } from "@shared/ui";
import { EmojiPicker } from "./EmojiPicker";
import { UserAccessList } from "./UserAccessList";

interface ICreateFolderPayload {
  name: string;
  emoji?: string | null;
  shared_user_ids?: number[];
}

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: ICreateFolderPayload) => void;
}

export const AddCategoryModal = ({ isOpen, onClose, onSubmit }: IProps) => {
  const [folderName, setFolderName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    const payload: ICreateFolderPayload = { name: folderName.trim() };
    if (selectedEmoji) payload.emoji = selectedEmoji;
    if (selectedUsers.length > 0) payload.shared_user_ids = selectedUsers;

    onSubmit(payload);
    setFolderName("");
    setSelectedEmoji(null);
    setSelectedUsers([]);
    onClose();
  };

  const handleClose = () => {
    setFolderName("");
    setSelectedEmoji(null);
    setSelectedUsers([]);
    onClose();
  };

  return (
    <If is={isOpen}>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden animate-in fade-in zoom-in duration-200">

          <div className="flex items-center justify-between px-10 py-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <FolderOpen size={22} className="fill-indigo-100 dark:fill-transparent" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                Новая папка
              </h3>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 min-h-[560px]">

              <div className="flex-1 px-10 py-8 space-y-7">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest uppercase">
                      ИКОНКА
                    </span>
                    <If is={selectedEmoji !== null}>
                      <span className="text-xl ml-1">{selectedEmoji}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedEmoji(null)}
                        className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer underline ml-1"
                      >
                        Сбросить
                      </button>
                    </If>
                  </div>

                  <EmojiPicker
                    selectedEmoji={selectedEmoji ?? ""}
                    onSelectEmoji={setSelectedEmoji}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest uppercase">
                    НАЗВАНИЕ
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Название папки..."
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex-1 px-10 py-8">
                <UserAccessList
                  selectedUsers={selectedUsers}
                  onToggleUser={handleToggleUser}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-10 py-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-8 py-3 rounded-full text-sm font-semibold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-white dark:bg-slate-900"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-full text-sm font-bold text-white! bg-indigo-600! hover:bg-indigo-700! transition-colors shadow-md cursor-pointer"
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      </div>
    </If>
  );
};
