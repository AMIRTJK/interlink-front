import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Check } from "lucide-react";
import { cn } from "@shared/lib";
import { Tooltip, Avatar, type IUserAvatarItem } from "@shared/ui";

export interface IParticipantUser extends IUserAvatarItem {
  id: string | number;
  name: string;
  role?: string;
}

interface IProps {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
  users: IParticipantUser[];
  isLoading?: boolean;
}

export const EventParticipantsSelect = ({
  value = [],
  onChange,
  users = [],
  isLoading = false,
}: IProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedIds = (value || []).map((v) => String(v));

  const toggleUser = (id: string | number) => {
    const idStr = String(id);
    const newSelected = selectedIds.includes(idStr)
      ? value.filter((v) => String(v) !== idStr)
      : [...value, typeof id === "number" ? id : Number(id) || id];
    onChange?.(newSelected);
  };

  const removeUser = (id: string | number) => {
    const idStr = String(id);
    onChange?.(value.filter((v) => String(v) !== idStr));
  };

  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.name || "").toLowerCase().includes(query.toLowerCase());
    const roleMatch = (u.role || "").toLowerCase().includes(query.toLowerCase());
    return nameMatch || roleMatch;
  });

  const selectedUsers = users.filter((u) => selectedIds.includes(String(u.id)));

  return (
    <div ref={containerRef} className="flex flex-col gap-2 relative">
      {/* Search Bar Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          className="w-full bg-zinc-100 dark:bg-slate-800 hover:bg-zinc-200/70 dark:hover:bg-slate-700/60 focus:bg-zinc-50 dark:focus:bg-slate-800 border border-zinc-200 dark:border-white/10 focus:border-blue-500 rounded-2xl h-10 pl-4 pr-10 outline-none text-xs font-semibold text-zinc-800 dark:text-slate-100 placeholder:text-zinc-400 dark:placeholder:text-slate-500 transition-all duration-200"
          placeholder={isLoading ? "Загрузка пользователей..." : "Поиск коллеги..."}
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer p-0.5"
            title="Очистить"
          >
            <X size={14} />
          </button>
        ) : (
          <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        )}

        {/* Dropdown menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100/60 dark:divide-white/5"
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSelected = selectedIds.includes(String(user.id));
                  return (
                    <div
                      key={user.id}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 transition-colors text-left cursor-pointer select-none",
                        isSelected
                          ? "bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/50"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/60",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Avatar colleague={user} className="w-7 h-7 text-[10px]" />
                        </div>
                        <Tooltip
                          title={
                            <div className="p-0.5 max-w-xs">
                              <p className="font-bold text-xs text-white">{user.name}</p>
                              {user.role && (
                                <p className="text-[10px] text-slate-300 mt-0.5 font-normal">
                                  {user.role}
                                </p>
                              )}
                            </div>
                          }
                          placement="right"
                        >
                          <div
                            className="min-w-0 flex-1 cursor-pointer"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              toggleUser(user.id);
                            }}
                          >
                            <p
                              className={cn(
                                "text-xs font-bold truncate",
                                isSelected
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-slate-800 dark:text-slate-100",
                              )}
                            >
                              {user.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {user.role || "Сотрудник"}
                            </p>
                          </div>
                        </Tooltip>
                      </div>

                      {/* Checkbox indicator */}
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault();
                          toggleUser(user.id);
                        }}
                        className={cn(
                          "w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all shrink-0 border cursor-pointer",
                          isSelected
                            ? "bg-[#3373e5] border-[#3373e5] text-white shadow-2xs"
                            : "border-slate-300 dark:border-white/20 bg-white/80 dark:bg-slate-800 hover:border-[#3373e5]/50",
                        )}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-5 px-4 text-center">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Не найдено
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    По вашему запросу сотрудники не найдены
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected participants badges */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {selectedUsers.map((u) => (
            <Tooltip key={u.id} title={`${u.name} — ${u.role || "Сотрудник"}`}>
              <span className="inline-flex items-center gap-2 pl-1 pr-2.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-white/10 rounded-full shadow-2xs text-xs font-bold text-slate-800 dark:text-slate-100">
                <Avatar colleague={u} className="w-5 h-5 text-[8px]" />
                <span className="truncate max-w-[130px] text-[11px]">{u.name}</span>
                <button
                  type="button"
                  onClick={() => removeUser(u.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer p-0.5 rounded-full"
                >
                  <X size={12} />
                </button>
              </span>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
};
