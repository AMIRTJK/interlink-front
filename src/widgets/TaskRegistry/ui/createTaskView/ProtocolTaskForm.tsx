import { motion } from "framer-motion";
import type { BatchRow, Colleague, SubRow } from "../../model/types";
import { ProtocolHeaderDetails } from "./protocol/ProtocolHeaderDetails";
import { ProtocolAgendaTable } from "./protocol/ProtocolAgendaTable";
import { ProtocolSignatures } from "./protocol/ProtocolSignatures";

interface IProps {
  colleagues: Colleague[];
  batchGlobal: {
    chairmanId: string;
    participants: string[];
    date: string;
    number: string;
  };
  onBatchGlobalChange: (val: {
    chairmanId: string;
    participants: string[];
    date: string;
    number: string;
  }) => void;
  participantsQuery: string;
  onParticipantsQueryChange: (val: string) => void;
  participantsOpen: boolean;
  onParticipantsOpenChange: (open: boolean) => void;
  onToggleParticipant: (id: string) => void;
  batchRows: BatchRow[];
  onAddBatchRow: () => void;
  onRemoveBatchRow: (id: number) => void;
  onUpdateBatchRow: (id: number, field: keyof BatchRow, value: string) => void;
  subRowsMap: Record<number, SubRow[]>;
  expandedRows: number[];
  onToggleRowExpand: (id: number) => void;
  onAddSubRow: (rowId: number) => void;
  onUpdateSubRow: (rowId: number, subId: number, title: string) => void;
  onRemoveSubRow: (rowId: number, subId: number) => void;
  chairmanSelectOpen: boolean;
  onChairmanSelectOpenChange: (open: boolean) => void;
  secretaryId: string;
  onSecretaryIdChange: (id: string) => void;
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
  secretaryId,
  onSecretaryIdChange,
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
      className="space-y-6"
    >
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
      />

      {/* Cards 3 & 4: ЭЦП Руководителя & ЭЦП Секретаря */}
      <ProtocolSignatures
        colleagues={colleagues}
        chairmanColleague={chairmanColleague}
        chairmanSigned={chairmanSigned}
        onChairmanSignedChange={onChairmanSignedChange}
        onChairmanIdChange={(id) =>
          onBatchGlobalChange({ ...batchGlobal, chairmanId: id })
        }
        onChairmanSelectOpenChange={onChairmanSelectOpenChange}
        secretaryColleague={secretaryColleague}
        secretarySigned={secretarySigned}
        onSecretarySignedChange={onSecretarySignedChange}
        secretaryId={secretaryId}
        onSecretaryIdChange={onSecretaryIdChange}
        secretaryAdding={secretaryAdding}
        onSecretaryAddingChange={onSecretaryAddingChange}
        secretaryQuery={secretaryQuery}
        onSecretaryQueryChange={onSecretaryQueryChange}
        secretaryOpen={secretaryOpen}
        onSecretaryOpenChange={onSecretaryOpenChange}
      />

      {/* Bottom Action Section */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-center justify-start">
          <button
            type="button"
            onClick={onBatchCreate}
            disabled={filledBatchCount === 0 || isSaving}
            className="px-7 py-3 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-200/80 dark:shadow-none transition-all cursor-pointer active:scale-95"
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
        <p className="text-xs font-bold text-[#636e9c] dark:text-slate-400">
          Заполнено задач: {filledBatchCount}
        </p>
      </div>
    </motion.div>
  );
}
