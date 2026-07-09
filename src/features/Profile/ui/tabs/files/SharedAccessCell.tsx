import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { If } from "@shared/ui";
import { IFileUser, getUserFullName } from "./lib";
import { UserAvatar } from "./UserAvatar";

interface IShareData {
  id: number;
  shared_with_user_id?: number;
  user_id?: number;
  shared_with?: IFileUser;
  user?: IFileUser;
}

interface IProps {
  fileId: number;
}

const parseShares = (raw: unknown): IFileUser[] => {
  let list: IShareData[] = [];
  const data = (raw as { data?: unknown })?.data;
  if (Array.isArray(data)) list = data as IShareData[];
  else if (Array.isArray((data as { data?: unknown })?.data)) list = (data as { data: IShareData[] }).data;

  return list.map((s) => {
    const u = s.shared_with || s.user;
    return (
      u || { id: s.shared_with_user_id || s.user_id || 0, full_name: `Пользователь #${s.shared_with_user_id || s.user_id}` }
    );
  });
};

export const SharedAccessCell = ({ fileId }: IProps) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const { data } = useGetQuery<Record<string, never>, unknown>({
    url: ApiRoutes.MY_FILES_SHARES.replace(":id", String(fileId)),
    useToken: true,
    options: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
  });

  const users = parseShares(data);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (users.length === 0) {
    return <span className="text-xs text-slate-300 dark:text-zinc-600">—</span>;
  }

  const openPopover = () => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.left });
    }
    setOpen((prev) => !prev);
  };

  const shown = users.slice(0, 3);
  const extra = users.length - shown.length;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={openPopover}
        className="flex items-center cursor-pointer"
        title="Пользователи с доступом"
      >
        <div className="flex items-center -space-x-2">
          {shown.map((u) => (
            <UserAvatar key={u.id} user={u} size={28} ring />
          ))}
          <If is={extra > 0}>
            <div className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-zinc-300">
              +{extra}
            </div>
          </If>
        </div>
      </button>

      <If is={open && !!coords}>
        {createPortal(
          <div
            ref={popoverRef}
            style={{ top: coords?.top, left: coords?.left }}
            className="fixed z-[9999] w-72 max-h-80 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
          >
            <p className="px-2 py-1.5 text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-widest uppercase">
              Доступ предоставлен ({users.length})
            </p>
            <div className="space-y-0.5">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <UserAvatar user={u} size={36} />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-700 dark:text-zinc-200 truncate">
                      {getUserFullName(u)}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-zinc-500 truncate">
                      {u.position || "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
      </If>
    </>
  );
};
