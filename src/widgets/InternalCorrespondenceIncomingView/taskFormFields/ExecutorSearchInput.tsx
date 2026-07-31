import React, { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import {
  ExecutorUser,
  AVATAR_COLORS,
  getInitials,
} from "./taskFormFieldsModel";

interface IProps {
  selectedExecutor: ExecutorUser | null;
  setSelectedExecutor: (u: ExecutorUser | null) => void;
}

export const ExecutorSearchInput: React.FC<IProps> = ({
  selectedExecutor,
  setSelectedExecutor,
}) => {
  const [searchParams, setSearchParams] = useState({ query: "" });
  const [showExecutorDropdown, setShowExecutorDropdown] = useState(false);

  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS,
    useToken: true,
    params: searchParams,
  });

  const apiUsersList: ExecutorUser[] =
    usersData?.data?.data && Array.isArray(usersData.data.data)
      ? usersData.data.data
      : Array.isArray(usersData)
        ? usersData
        : [];

  return (
    <div className="relative">
      <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <Search size={13} className="text-slate-400 flex-shrink-0" />
        {selectedExecutor ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border",
                AVATAR_COLORS[selectedExecutor.id % AVATAR_COLORS.length]
              )}
            >
              {getInitials(selectedExecutor.full_name)}
            </div>
            <span className="text-sm text-slate-800 flex-1 truncate">
              {selectedExecutor.full_name}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedExecutor(null);
                setSearchParams({ query: "" });
              }}
              className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0 cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={searchParams.query}
            onChange={(e) => {
              setSearchParams({ query: e.target.value });
              setShowExecutorDropdown(true);
            }}
            onFocus={() => setShowExecutorDropdown(true)}
            onBlur={() => setTimeout(() => setShowExecutorDropdown(false), 150)}
            placeholder="Найти исполнителя..."
            className="flex-1 text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent min-w-0"
          />
        )}
        {loadingUsers && !selectedExecutor && (
          <Loader2 size={13} className="animate-spin text-indigo-400 flex-shrink-0" />
        )}
      </div>
      {showExecutorDropdown && !selectedExecutor && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-y-auto max-h-48">
          {loadingUsers && apiUsersList.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-3 text-slate-400">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs">Загрузка...</span>
            </div>
          ) : apiUsersList.length > 0 ? (
            apiUsersList.map((u) => (
              <button
                key={u.id}
                type="button"
                onMouseDown={() => {
                  setSelectedExecutor(u);
                  setShowExecutorDropdown(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border",
                    AVATAR_COLORS[u.id % AVATAR_COLORS.length]
                  )}
                >
                  {getInitials(u.full_name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {u.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate font-mono">
                    {u.phone}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-3">Ничего не найдено</p>
          )}
        </div>
      )}
    </div>
  );
};
