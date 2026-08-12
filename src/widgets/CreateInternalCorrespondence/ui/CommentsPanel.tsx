import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, RotateCw, Send, X } from "lucide-react";
import { cn } from "@shared/lib";
import { If, Loader } from "@shared/ui";
import {
  COMMENT_MAX_LENGTH,
  useCorrespondenceComments,
} from "../api/useCorrespondenceComments";
import { CommentItem } from "./CommentItem";
import { useAutoPositionDrawer } from "../lib/useAutoPositionDrawer";
import { PANEL_TAB_TOP, PANEL_DRAWER_TOP_IN_TOOLBAR } from "../lib/constants";

interface ICommentsPanelProps {
  isOpen: boolean;
  hideTab?: boolean;
  openLeft?: boolean;
  onOpen: () => void;
  onClose: () => void;
  docId?: string | number;
  currentUserId?: string | number | null;
}

export const CommentsPanel: React.FC<ICommentsPanelProps> = ({
  isOpen,
  hideTab,
  openLeft = false,
  onOpen,
  onClose,
  docId,
  currentUserId,
}) => {
  const [newCommentText, setNewCommentText] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useAutoPositionDrawer({ isOpen, drawerRef });

  const { comments, isLoading, isError, refetch, sendComment, isSending } =
    useCorrespondenceComments({ docId, isOpen });

  // Свежие комментарии внизу списка — держим прокрутку на них.
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [isOpen, comments.length]);

  const handleSendComment = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newCommentText.trim() || isSending) return;
    sendComment(newCommentText, () => setNewCommentText(""));
  };

  const isSendDisabled = !newCommentText.trim() || isSending;

  return (
    <>
      {!hideTab && (
        <div className="absolute z-20 right-[-36px] top-[370px]">
          <motion.button
            onClick={isOpen ? onClose : onOpen}
            className={cn(
              "bg-white border border-slate-200 border-l-0 rounded-r-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
              isOpen ? "bg-slate-50" : "hover:bg-slate-50",
            )}
            aria-label="Комментарии"
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: "oklch(0.65 0.2 240)" }}
            />
            <span
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontSize: 11,
                fontWeight: 600,
                color: "#475569",
                letterSpacing: "0.08em",
              }}
            >
              Комментарии
            </span>
            <If is={comments.length > 0}>
              <span className="text-[10px] font-bold text-white bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center -mt-1">
                {comments.length}
              </span>
            </If>
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <div
            ref={drawerRef}
            className="absolute z-[500]"
            style={{
              top: hideTab ? PANEL_DRAWER_TOP_IN_TOOLBAR : PANEL_TAB_TOP.third,
              ...(openLeft
                ? { right: "calc(100% + 12px)" }
                : { left: "calc(100% + 12px)" }),
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
              style={{
                maxHeight: "var(--icc-panel-max-h, 70vh)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Panel Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-blue-500" />
                  <span className="font-semibold text-sm text-slate-800">
                    Комментарии
                  </span>
                  <span className="bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-0.5 font-bold">
                    {comments.length}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="hover:bg-slate-200/60 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Закрыть панель комментариев"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Comments List */}
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 min-h-[160px] max-h-[360px]"
              >
                <If is={isLoading}>
                  <Loader height={140} minHeight={140} />
                </If>
                <If is={!isLoading && isError}>
                  <div className="py-8 border border-dashed border-rose-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 text-xs text-center px-4">
                    <span>Не удалось загрузить комментарии</span>
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                      aria-label="Повторить загрузку комментариев"
                    >
                      <RotateCw size={12} />
                      <span>Повторить</span>
                    </button>
                  </div>
                </If>
                <If is={!isLoading && !isError && comments.length === 0}>
                  <div className="py-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs text-center px-4">
                    <MessageSquare size={20} className="text-slate-300" />
                    <span>Пока нет комментариев</span>
                    <span className="text-[11px] text-slate-400">
                      Напишите первый комментарий ниже
                    </span>
                  </div>
                </If>
                <If is={!isLoading && !isError && comments.length > 0}>
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      isOwn={
                        currentUserId != null &&
                        String(comment.user_id) === String(currentUserId)
                      }
                    />
                  ))}
                </If>
              </div>

              {/* Add Comment Input Form */}
              <form
                onSubmit={handleSendComment}
                className="p-3 border-t border-slate-100 bg-white flex flex-col gap-2 flex-shrink-0"
              >
                <div className="relative flex items-center">
                  <textarea
                    rows={2}
                    value={newCommentText}
                    maxLength={COMMENT_MAX_LENGTH}
                    disabled={isSending}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendComment();
                      }
                    }}
                    placeholder="Напишите комментарий..."
                    className="w-full text-xs p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none transition-all placeholder:text-slate-400 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isSendDisabled}
                    className={cn(
                      "absolute right-2 bottom-2.5 p-1.5 rounded-lg transition-all cursor-pointer",
                      !isSendDisabled
                        ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                        : "bg-slate-100 text-slate-300 cursor-not-allowed",
                    )}
                    aria-label="Отправить комментарий"
                  >
                    <Send size={13} />
                  </button>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 px-1">
                  <span>{isSending ? "Отправка..." : "Enter для отправки"}</span>
                  <span className="font-mono">
                    {newCommentText.length}/{COMMENT_MAX_LENGTH}
                  </span>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
