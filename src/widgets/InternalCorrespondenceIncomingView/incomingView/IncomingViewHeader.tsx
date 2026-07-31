import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Eye, ChevronDown, Download } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { UserActionCluster } from "./UserActionCluster";
import { ActionUser, TActionId } from "./incomingViewModel";

interface IProps {
  onBack: () => void;
  onOpenPreview: () => void;
  isResolvingBody: boolean;
  repliedUsers: ActionUser[];
  forwardedUsers: ActionUser[];
  acknowledgedUsers: ActionUser[];
  showActionMenu: boolean;
  onToggleActionMenu: () => void;
  actionMenuRef: React.RefObject<HTMLDivElement | null>;
  visibleActionItems: Array<{
    id: TActionId;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
    hint?: string;
  }>;
  onActionClick: (id: TActionId) => void;
  onDownloadPdf: () => void;
}

export const IncomingViewHeader: React.FC<IProps> = ({
  onBack,
  onOpenPreview,
  isResolvingBody,
  repliedUsers,
  forwardedUsers,
  acknowledgedUsers,
  showActionMenu,
  onToggleActionMenu,
  actionMenuRef,
  visibleActionItems,
  onActionClick,
  onDownloadPdf,
}) => {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white relative z-[100]">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-base font-bold text-slate-900 leading-tight">
            Просмотр входящего письма
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Просмотр */}
        <button
          onClick={onOpenPreview}
          disabled={isResolvingBody}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye size={14} />
          <span>Просмотр</span>
        </button>

        {/* Действия над письмом */}
        <UserActionCluster
          label="Ответили"
          users={repliedUsers}
          accent={{ avatar: "bg-blue-500", date: "text-blue-600" }}
        />
        <UserActionCluster
          label="Переслали"
          users={forwardedUsers}
          accent={{ avatar: "bg-amber-500", date: "text-amber-600" }}
        />
        <UserActionCluster
          label="Ознакомились"
          users={acknowledgedUsers}
          accent={{ avatar: "bg-emerald-500", date: "text-emerald-600" }}
        />

        {/* Действие — выпадающее меню */}
        <div className="relative" ref={actionMenuRef}>
          <button
            onClick={onToggleActionMenu}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <span>Действие</span>
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform duration-200",
                showActionMenu && "rotate-180"
              )}
            />
          </button>
          <AnimatePresence>
            {showActionMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                style={{ transformOrigin: "top right" }}
                className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 w-64 py-2 overflow-hidden z-[1000]"
              >
                {visibleActionItems.map((menuItem, idx) => (
                  <motion.button
                    key={menuItem.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.035, duration: 0.18 }}
                    onClick={() => onActionClick(menuItem.id)}
                    disabled={menuItem.disabled}
                    className={cn(
                      "w-full px-4 py-2.5 text-sm flex items-center gap-3 transition-colors text-left",
                      menuItem.disabled
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-700 hover:bg-slate-50 cursor-pointer"
                    )}
                  >
                    <menuItem.icon
                      size={16}
                      className={cn(
                        "flex-shrink-0",
                        menuItem.disabled ? "text-slate-200" : "text-slate-400"
                      )}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block">{menuItem.label}</span>
                      <If is={!!menuItem.hint}>
                        <span className="block text-[10px] leading-tight text-slate-400 whitespace-normal">
                          {menuItem.hint}
                        </span>
                      </If>
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Скачать PDF */}
        <button
          onClick={onDownloadPdf}
          disabled={isResolvingBody}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          <span>Скачать PDF</span>
        </button>
      </div>
    </div>
  );
};
