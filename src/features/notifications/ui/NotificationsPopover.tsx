import { FC } from "react";
import { Loader2, X } from "lucide-react";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../api/useNotifications";
import { getNotificationMeta } from "../lib/meta";
import { timeAgo } from "../lib/timeAgo";

interface IProps {
  /** Открыт ли поповер — управляет ленивой загрузкой списка. */
  open: boolean;
}

/**
 * Содержимое поповера уведомлений: список, отметка «прочитано», удаление и
 * «прочитать все». Полностью поддерживает светлую и тёмную тему.
 */
export const NotificationsPopover: FC<IProps> = ({ open }) => {
  const { notifications, isLoading, isFetching } = useNotifications(open);
  const markAll = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const removeNotification = useDeleteNotification();

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const showLoader = isLoading || (isFetching && notifications.length === 0);

  return (
    <div className="w-80 bg-white dark:bg-zinc-800 rounded-[2.5rem] overflow-hidden">
      <div className="flex justify-between items-center px-5 pt-5 pb-3 border-b border-gray-100 dark:border-zinc-700/60">
        <span className="font-semibold text-gray-800 dark:text-zinc-100">
          Уведомления
        </span>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isLoading}
            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            Прочитать все
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-1.5 custom-scrollbar">
        {showLoader ? (
          <div className="flex justify-center items-center py-10 text-gray-400 dark:text-zinc-500">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((note) => {
            const meta = getNotificationMeta(note.type);
            return (
              <div
                key={note.id}
                onClick={() =>
                  !note.is_read && markRead.mutate({ id: note.id })
                }
                className={`group relative p-3 pr-4 rounded-2xl flex gap-3 transition-colors cursor-pointer ${
                  note.is_read
                    ? "hover:bg-gray-50 dark:hover:bg-zinc-700/40"
                    : "bg-blue-50/60 hover:bg-blue-50 dark:bg-blue-500/10 dark:hover:bg-blue-500/15"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${meta.circleClass}`}
                  >
                    <meta.Icon size={16} className={meta.iconClass} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm m-0 pr-3 break-words ${
                      note.is_read
                        ? "text-gray-700 dark:text-zinc-300 font-medium"
                        : "text-gray-900 dark:text-white font-semibold"
                    }`}
                  >
                    {note.title}
                  </h4>
                  {note.body && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 mb-1 line-clamp-2 leading-relaxed">
                      {note.body}
                    </p>
                  )}
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">
                    {timeAgo(note.created_at)}
                  </span>
                </div>

                {!note.is_read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-blue-500 rounded-full transition-opacity group-hover:opacity-0" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification.mutate({ id: note.id });
                  }}
                  aria-label="Удалить уведомление"
                  className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 dark:text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-400 dark:text-zinc-500 text-sm">
            Нет новых уведомлений
          </div>
        )}
      </div>
    </div>
  );
};
