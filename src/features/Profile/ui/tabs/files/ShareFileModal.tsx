import React, { useState } from "react";
import { X, Share2, UserPlus, Link } from "lucide-react";
import { IApiFile } from "./lib";
import { If } from "@shared/ui";

interface IProps {
  file: IApiFile | null;
  onClose: () => void;
}

export const ShareFileModal = ({ file, onClose }: IProps) => {
  const [userQuery, setUserQuery] = useState("");
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://interlink.app/files/share/${file.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGrantAccess = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Доступ к файлу "${file.original_name}" успешно предоставлен!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500! flex items-center justify-center text-white!">
              <Share2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">
                Поделиться файлом
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-zinc-550 truncate max-w-[250px]">
                {file.original_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGrantAccess} className="p-6 space-y-5">
          {/* User Input */}
          <div className="relative">
            <UserPlus
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Добавить пользователя..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-450"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Доступ к файлу</span>
            Приглашенный пользователь сможет только просматривать и скачивать файл. Редактирование не поддерживается.
          </div>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-zinc-350 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
          >
            <Link size={14} className="text-slate-400" />
            <span>{copied ? "Ссылка скопирована!" : "Копировать ссылку"}</span>
          </button>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-full text-xs font-bold text-slate-600 dark:text-zinc-400 border border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer bg-white dark:bg-slate-900"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white! upload-btn-gradient hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/10 cursor-pointer"
            >
              Предоставить доступ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
