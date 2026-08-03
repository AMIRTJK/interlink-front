import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, X, Trash2, Loader2 } from "lucide-react";
import { cn, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { correspondencePermissionsKey } from "@entities/correspondence";
import { If } from "@shared/ui";
import { VisorCandidatePicker } from "./VisorCandidatePicker";
import { IVisorUser, formatVisorDate, getVisorInitials } from "./model";

interface IProps {
  correspondenceId: string | number;
  visors: IVisorUser[];
  isLoading: boolean;
  canInvite: boolean;
  onClose: () => void;
}

export const VisorsPanel: React.FC<IProps> = ({
  correspondenceId,
  visors,
  isLoading,
  canInvite,
  onClose,
}) => {
  const docId = String(correspondenceId || "");

  const invalidateKeys = [
    ApiRoutes.INTERNAL_VISORS.replace(":id", docId),
    ApiRoutes.INTERNAL_VISOR_CANDIDATES.replace(":id", docId),
    ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", docId),
    ApiRoutes.GET_INTERNAL_INCOMING,
    ApiRoutes.GET_INTERNAL_COUNTERS,
    // Приглашение визирующего открывает создание поручения — контекстные
    // права по документу после этого меняются.
    correspondencePermissionsKey(docId),
  ];

  const { mutate: inviteVisor, isPending: isInviting } = useMutationQuery<{
    user_id: number;
  }>({
    url: ApiRoutes.INTERNAL_VISORS.replace(":id", docId),
    method: "POST",
    messages: {
      success: "Визирующий приглашён",
      error: "Не удалось пригласить визирующего",
      invalidate: invalidateKeys,
    },
  });

  const { mutate: revokeVisor, isPending: isRevoking } = useMutationQuery<{
    user_id: number;
  }>({
    url: (payload) =>
      ApiRoutes.INTERNAL_VISOR_REVOKE.replace(":id", docId).replace(
        ":userId",
        String(payload.user_id),
      ),
    method: "DELETE",
    messages: {
      success: "Приглашение отозвано",
      error: "Не удалось отозвать приглашение",
      invalidate: invalidateKeys,
    },
  });

  const invitedIds = visors.map((visor) => visor.id);

  return (
    <motion.div
      initial={{ x: 12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 12, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="absolute w-80 bg-white shadow-2xl rounded-2xl border border-slate-200 z-[500] flex flex-col overflow-hidden"
      style={{
        right: "calc(100% + 12px)",
        top: 10,
        maxHeight: "var(--icc-panel-max-h, calc(100vh - 140px))",
      }}
    >
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-violet-500" />
          <span className="text-sm font-bold text-slate-900">Визирующие</span>
          <span className="bg-slate-100 text-slate-600 text-xs rounded-full px-2 py-0.5 font-medium">
            {visors.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Закрыть панель визирующих"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 min-h-0 text-left">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Приглашены
          </span>

          <If is={isLoading && visors.length === 0}>
            <div className="flex items-center justify-center gap-2 py-3 text-slate-400">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs">Загрузка...</span>
            </div>
          </If>

          <If is={!isLoading && visors.length === 0}>
            <p className="text-xs text-slate-400 leading-relaxed">
              Визирующий ещё не приглашён. Пригласите руководителя — письмо
              появится у него во «Входящих», после чего по нему можно будет
              создать поручение.
            </p>
          </If>

          {visors.map((visor) => (
            <div
              key={visor.id}
              className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2"
            >
              <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 border border-violet-200 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                {getVisorInitials(visor.full_name)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {visor.full_name}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {visor.position || "Сотрудник"}
                </p>
                <If is={!!formatVisorDate(visor.invited_at)}>
                  <p className="text-[10px] text-slate-400">
                    Приглашён {formatVisorDate(visor.invited_at)}
                  </p>
                </If>
              </div>
              <If is={canInvite}>
                <button
                  type="button"
                  disabled={isRevoking}
                  onClick={() => revokeVisor({ user_id: visor.id })}
                  className={cn(
                    "p-1.5 rounded-lg text-slate-400 transition-colors flex-shrink-0",
                    isRevoking
                      ? "cursor-not-allowed opacity-60"
                      : "hover:text-rose-500 hover:bg-rose-50 cursor-pointer",
                  )}
                  aria-label="Отозвать приглашение"
                >
                  <Trash2 size={14} />
                </button>
              </If>
            </div>
          ))}
        </div>

        <If is={canInvite}>
          <VisorCandidatePicker
            correspondenceId={correspondenceId}
            invitedIds={invitedIds}
            isInviting={isInviting}
            onInvite={(user) => inviteVisor({ user_id: user.id })}
          />
        </If>

        <If is={!canInvite}>
          <p className="text-xs text-slate-400 leading-relaxed">
            У вас нет прав приглашать визирующих по этому письму.
          </p>
        </If>
      </div>
    </motion.div>
  );
};
