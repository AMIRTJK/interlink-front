import React, { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, X, Plus, Loader2 } from "lucide-react";
import { cn, useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { If } from "@shared/ui";
import { TaskFormFields, type PriorityLevel, type ExecutorUser } from "./TaskFormFields";
import { TaskItemCard, type IAssignmentData } from "./TaskItemCard";

interface IProps {
  onClose: () => void;
  correspondenceId: string | number;
}

export const TaskPanel: React.FC<IProps> = ({ onClose, correspondenceId }) => {
  const [selectedExecutor, setSelectedExecutor] = useState<ExecutorUser | null>(null);
  const [taskText, setTaskText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("medium");
  const [note, setNote] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const docId = String(correspondenceId || "");

  const { data: assignmentsData, isLoading: loadingAssignments, refetch } = useGetQuery({
    url: docId ? ApiRoutes.INTERNAL_ASSIGNMENTS.replace(":id", docId) : "",
    useToken: true,
    options: { enabled: !!docId },
  });

  const assignmentsList: IAssignmentData[] =
    assignmentsData?.data?.items ||
    assignmentsData?.data?.assignments ||
    assignmentsData?.items ||
    (Array.isArray(assignmentsData?.data) ? assignmentsData.data : []);

  const { mutate: createAssignment, isPending: submitting } = useMutationQuery({
    url: docId ? ApiRoutes.INTERNAL_ASSIGNMENTS.replace(":id", docId) : "",
    method: "POST",
    messages: {
      success: "Поручение создано",
      error: "Не удалось создать поручение",
    },
    queryOptions: {
      onSuccess: () => {
        refetch();
        setIsCreatingNew(false);
        setSelectedExecutor(null);
        setTaskText("");
        setDeadline("");
        setNote("");
      },
    },
  });

  const handleSubmit = () => {
    if (!selectedExecutor || !taskText.trim() || !docId) return;

    createAssignment({
      executor_user_id: selectedExecutor.id,
      text: taskText.trim(),
      due_at: deadline ? `${deadline} 18:00:00` : "",
      priority,
      note: note.trim() || undefined,
    });
  };

  const submitDisabled = submitting || !selectedExecutor || !taskText.trim();
  const showForm = isCreatingNew || (assignmentsList.length === 0 && !loadingAssignments);

  return (
    <motion.div
      initial={{ x: 12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 12, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="absolute w-84 bg-white shadow-2xl rounded-2xl border border-slate-200 z-[500] flex flex-col overflow-hidden"
      style={{
        right: "calc(100% + 12px)",
        top: 10,
        maxHeight: "var(--icc-panel-max-h, calc(100vh - 140px))",
      }}
    >
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-900">
            {showForm ? "Новое поручение" : `Поручения (${assignmentsList.length})`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <If is={!showForm && assignmentsList.length > 0}>
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Создать</span>
            </button>
          </If>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <If is={showForm}>
        <div className="flex flex-col flex-1 overflow-y-auto min-h-0">
          <TaskFormFields
            selectedExecutor={selectedExecutor}
            setSelectedExecutor={setSelectedExecutor}
            taskText={taskText}
            setTaskText={setTaskText}
            deadline={deadline}
            setDeadline={setDeadline}
            priority={priority}
            setPriority={setPriority}
            note={note}
            setNote={setNote}
          />

          <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100 flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitDisabled}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center",
                submitDisabled
                  ? "bg-indigo-300 text-white cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 cursor-pointer",
              )}
            >
              <If is={submitting}>
                <Loader2 size={14} className="animate-spin" />
              </If>
              <If is={!submitting}>
                <ClipboardList size={14} />
              </If>
              <span>{submitting ? "Назначение..." : "Назначить"}</span>
            </button>
            <If is={assignmentsList.length > 0}>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Назад
              </button>
            </If>
          </div>
        </div>
      </If>

      <If is={!showForm}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 custom-scrollbar">
          <If is={loadingAssignments && assignmentsList.length === 0}>
            <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-xs">
              <Loader2 size={16} className="animate-spin text-indigo-500" />
              <span>Загрузка поручений...</span>
            </div>
          </If>

          <If is={!loadingAssignments && assignmentsList.length === 0}>
            <div className="text-center py-10 text-slate-400 text-xs">
              Назначенных поручений пока нет
            </div>
          </If>

          {assignmentsList.map((item) => (
            <TaskItemCard key={item.id} item={item} />
          ))}
        </div>
      </If>
    </motion.div>
  );
};
