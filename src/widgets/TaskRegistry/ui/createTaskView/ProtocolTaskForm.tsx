import { Pen, ArrowLeft, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { BatchRow, Colleague, SubRow, IBatchGlobal } from "../../model/types";
import { ProtocolHeaderDetails } from "./protocol/ProtocolHeaderDetails";
import { ProtocolAgendaTable } from "./protocol/ProtocolAgendaTable";
import { ProtocolSignatures } from "./protocol/ProtocolSignatures";

interface IProps {
  colleagues: Colleague[];
  batchGlobal: IBatchGlobal;
  onBatchGlobalChange: (val: IBatchGlobal) => void;
  participantsQuery: string;
  onParticipantsQueryChange: (val: string) => void;
  participantsOpen: boolean;
  onParticipantsOpenChange: (open: boolean) => void;
  onToggleParticipant: (id: string) => void;
  batchRows: BatchRow[];
  onAddBatchRow: () => void;
  onRemoveBatchRow: (id: number) => void;
  onUpdateBatchRow: (id: number, field: keyof BatchRow, value: any) => void;
  subRowsMap: Record<number, SubRow[]>;
  expandedRows: number[];
  onToggleRowExpand: (id: number) => void;
  onAddSubRow: (rowId: number) => void;
  onUpdateSubRow: (rowId: number, subId: number, title: string) => void;
  onRemoveSubRow: (rowId: number, subId: number) => void;
  chairmanSelectOpen: boolean;
  onChairmanSelectOpenChange: (open: boolean) => void;
  onToggleChairman?: (id: string) => void;
  onRemoveChairman?: (id: string) => void;
  secretaryId: string;
  onSecretaryIdChange: (id: string) => void;
  secretaryIds?: string[];
  onToggleSecretary?: (id: string) => void;
  onRemoveSecretary?: (id: string) => void;
  secretaryAdding: boolean;
  onSecretaryAddingChange: (adding: boolean) => void;
  secretaryQuery: string;
  onSecretaryQueryChange: (val: string) => void;
  secretaryOpen: boolean;
  onSecretaryOpenChange: (open: boolean) => void;
  chairmanSigned: string | null;
  onChairmanSignedChange: (val: string | null) => void;
  secretarySigned: string | null;
  onSecretarySignedChange: (val: string | null) => void;
  filledBatchCount: number;
  isSaving: boolean;
  onBatchCreate: () => void;
  mode?: "create" | "edit" | "view";
  onModeChange?: (mode: "create" | "edit" | "view") => void;
}

export function ProtocolTaskForm({
  colleagues,
  batchGlobal,
  onBatchGlobalChange,
  participantsQuery,
  onParticipantsQueryChange,
  participantsOpen,
  onParticipantsOpenChange,
  onToggleParticipant,
  batchRows,
  onAddBatchRow,
  onRemoveBatchRow,
  onUpdateBatchRow,
  subRowsMap,
  expandedRows,
  onToggleRowExpand,
  onAddSubRow,
  onUpdateSubRow,
  onRemoveSubRow,
  chairmanSelectOpen,
  onChairmanSelectOpenChange,
  onToggleChairman,
  onRemoveChairman,
  secretaryId,
  onSecretaryIdChange,
  secretaryIds = [],
  onToggleSecretary,
  onRemoveSecretary,
  secretaryAdding,
  onSecretaryAddingChange,
  secretaryQuery,
  onSecretaryQueryChange,
  secretaryOpen,
  onSecretaryOpenChange,
  chairmanSigned,
  onChairmanSignedChange,
  secretarySigned,
  onSecretarySignedChange,
  filledBatchCount,
  isSaving,
  onBatchCreate,
  mode = "create",
  onModeChange,
}: IProps) {
  const chairmanColleague =
    colleagues.find((c) => c.id === batchGlobal.chairmanId) || null;
  const secretaryColleague =
    colleagues.find((c) => c.id === secretaryId) || null;

  return (
    <motion.div
      key="protocol-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 pb-28"
    >
      {/* Mode Status Bar when in View or Edit mode */}
      {mode === "view" && (
        <div className="flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-800/40 border border-blue-200/80 dark:border-white/10 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl">
              Режим просмотра
            </span>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Протокол готов к чтению и печати
            </p>
          </div>
          {onModeChange && (
            <button
              type="button"
              onClick={() => onModeChange("edit")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-700 hover:bg-slate-50 border border-slate-200 dark:border-white/10 text-[#1e2548] dark:text-slate-100 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Pen size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Редактировать протокол</span>
            </button>
          )}
        </div>
      )}

      {/* Card 1: Детальная информация */}
      <ProtocolHeaderDetails
        colleagues={colleagues}
        batchGlobal={batchGlobal}
        onBatchGlobalChange={onBatchGlobalChange}
        participantsQuery={participantsQuery}
        onParticipantsQueryChange={onParticipantsQueryChange}
        participantsOpen={participantsOpen}
        onParticipantsOpenChange={onParticipantsOpenChange}
        onToggleParticipant={onToggleParticipant}
        chairmanSelectOpen={chairmanSelectOpen}
        onChairmanSelectOpenChange={onChairmanSelectOpenChange}
        mode={mode}
      />

      {/* Card 2: ПОВЕСТКА ДНЯ И РЕШЕНИЯ */}
      <ProtocolAgendaTable
        colleagues={colleagues}
        batchRows={batchRows}
        onAddBatchRow={onAddBatchRow}
        onRemoveBatchRow={onRemoveBatchRow}
        onUpdateBatchRow={onUpdateBatchRow}
        subRowsMap={subRowsMap}
        expandedRows={expandedRows}
        onToggleRowExpand={onToggleRowExpand}
        onAddSubRow={onAddSubRow}
        onUpdateSubRow={onUpdateSubRow}
        onRemoveSubRow={onRemoveSubRow}
        mode={mode}
      />

      {/* Cards 3 & 4: ЭЦП Руководителя & ЭЦП Секретаря */}
      <ProtocolSignatures
        colleagues={colleagues}
        chairmanColleague={chairmanColleague}
        chairmanSigned={chairmanSigned}
        onChairmanSignedChange={onChairmanSignedChange}
        chairmanIds={batchGlobal.chairmanIds}
        onToggleChairman={onToggleChairman}
        onRemoveChairman={onRemoveChairman}
        onChairmanIdChange={(id) =>
          onBatchGlobalChange({ ...batchGlobal, chairmanId: id })
        }
        onChairmanSelectOpenChange={onChairmanSelectOpenChange}
        secretaryColleague={secretaryColleague}
        secretarySigned={secretarySigned}
        onSecretarySignedChange={onSecretarySignedChange}
        secretaryId={secretaryId}
        onSecretaryIdChange={onSecretaryIdChange}
        secretaryIds={secretaryIds}
        onToggleSecretary={onToggleSecretary}
        onRemoveSecretary={onRemoveSecretary}
        secretaryAdding={secretaryAdding}
        onSecretaryAddingChange={onSecretaryAddingChange}
        secretaryQuery={secretaryQuery}
        onSecretaryQueryChange={onSecretaryQueryChange}
        secretaryOpen={secretaryOpen}
        onSecretaryOpenChange={onSecretaryOpenChange}
        mode={mode}
      />

      {/* Bottom Action Section */}
      {mode !== "view" ? (
        <div className="flex flex-col gap-2 pt-4 pb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBatchCreate}
              disabled={filledBatchCount === 0 || isSaving}
              className="px-7 py-3 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-200/80 dark:shadow-none transition-all cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <Check size={14} />
              <span>{isSaving ? "Сохранение..." : mode === "edit" ? "Сохранить изменения" : "Сохранить"}</span>
            </button>
            {mode === "edit" && onModeChange && (
              <button
                type="button"
                onClick={() => onModeChange("view")}
                className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold rounded-xl text-xs transition-all cursor-pointer"
              >
                Отмена
              </button>
            )}
          </div>
          <p className="text-xs font-bold text-[#636e9c] dark:text-slate-400">
            Заполнено задач: {filledBatchCount}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 pt-4 pb-8">
          {onModeChange && (
            <button
              type="button"
              onClick={() => onModeChange("edit")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-blue-200/80 dark:shadow-none transition-all cursor-pointer flex items-center gap-2"
            >
              <Pen size={14} />
              <span>Редактировать протокол</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
