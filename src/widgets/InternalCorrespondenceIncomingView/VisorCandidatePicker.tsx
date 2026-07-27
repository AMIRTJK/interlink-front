import React, { useState } from "react";
import { Search, Loader2, UserPlus } from "lucide-react";
import { cn, useDebouncedCallback, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { If } from "@shared/ui";
import { IVisorUser, getVisorInitials, normalizeVisors } from "./model";

const CANDIDATES_PER_PAGE = 20;

interface IProps {
  correspondenceId: string | number;
  invitedIds: number[];
  isInviting: boolean;
  onInvite: (user: IVisorUser) => void;
}

export const VisorCandidatePicker: React.FC<IProps> = ({
  correspondenceId,
  invitedIds,
  isInviting,
  onInvite,
}) => {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const applyQuery = useDebouncedCallback((...args: unknown[]) => {
    setQuery(String(args[0] ?? ""));
  }, 400);

  const { data, isLoading } = useGetQuery({
    url: correspondenceId
      ? ApiRoutes.INTERNAL_VISOR_CANDIDATES.replace(
          ":id",
          String(correspondenceId),
        )
      : "",
    useToken: true,
    params: { search: query, page: 1, per_page: CANDIDATES_PER_PAGE },
    options: { enabled: !!correspondenceId, refetchOnWindowFocus: false },
  });

  const candidates = normalizeVisors(data);

  return (
    <div className="flex flex-col gap-2 min-h-0">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Кого пригласить
      </label>

      <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <Search size={13} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            applyQuery(e.target.value);
          }}
          placeholder="Поиск руководителя..."
          className="flex-1 text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent min-w-0"
        />
        <If is={isLoading}>
          <Loader2
            size={13}
            className="animate-spin text-indigo-400 flex-shrink-0"
          />
        </If>
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-56 pr-0.5">
        <If is={isLoading && candidates.length === 0}>
          <div className="flex items-center justify-center gap-2 py-4 text-slate-400">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs">Загрузка...</span>
          </div>
        </If>

        <If is={!isLoading && candidates.length === 0}>
          <p className="text-xs text-slate-400 text-center py-4">
            Подходящих визирующих не найдено
          </p>
        </If>

        {candidates.map((candidate) => {
          const isInvited = invitedIds.includes(candidate.id);
          return (
            <button
              key={candidate.id}
              type="button"
              disabled={isInvited || isInviting}
              onClick={() => onInvite(candidate)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border text-left transition-colors",
                isInvited
                  ? "border-emerald-100 bg-emerald-50/60 cursor-not-allowed"
                  : "border-slate-100 hover:bg-slate-50 hover:border-slate-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                {getVisorInitials(candidate.full_name)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-slate-900 truncate">
                  {candidate.full_name}
                </span>
                <span className="block text-[10px] text-slate-500 truncate">
                  {candidate.position || "Сотрудник"}
                </span>
              </span>
              <If is={isInvited}>
                <span className="text-[10px] font-semibold text-emerald-600 flex-shrink-0">
                  Приглашён
                </span>
              </If>
              <If is={!isInvited}>
                <UserPlus size={14} className="text-slate-400 flex-shrink-0" />
              </If>
            </button>
          );
        })}
      </div>
    </div>
  );
};
