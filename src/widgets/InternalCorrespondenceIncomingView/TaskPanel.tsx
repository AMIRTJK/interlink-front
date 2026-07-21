import React, { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, X, Check, Clock } from "lucide-react";
import { cn, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { TaskFormFields, type PriorityLevel, type ExecutorUser } from "./TaskFormFields";

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
  const [submitted, setSubmitted] = useState(false);

  const { mutate: createAssignment, isPending: submitting } = useMutationQuery({
    url: correspondenceId
      ? ApiRoutes.INTERNAL_ASSIGNMENTS.replace(":id", String(correspondenceId))
      : "",
    method: "POST",
    messages: {
      success: "Поручение создано",
      error: "Не удалось создать поручение",
    },
    queryOptions: {
      onSuccess: () => {
        setSubmitted(true);
        setTimeout(onClose, 1200);
      },
    },
  });

  const handleSubmit = () => {
    if (!selectedExecutor || !taskText.trim() || !correspondenceId) return;

    createAssignment({
      executor_user_id: selectedExecutor.id,
      text: taskText.trim(),
      due_at: deadline ? `${deadline} 18:00:00` : "",
      priority,
      note: note.trim() || undefined,
    });
  };

  const submitDisabled = submitting || !selectedExecutor || !taskText.trim();

  return (
    <motion.div
      initial={{ x: 12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 12, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="absolute w-80 bg-white shadow-2xl rounded-2xl border border-slate-200 z-30 flex flex-col overflow-hidden"
      style={{
        right: "calc(100% + 12px)",
        top: 10,
        maxHeight: "var(--icc-panel-max-h, calc(100vh - 140px))",
      }}
    >
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-indigo-500" />
          <span className="text-sm font-bold text-slate-900">Новое поручение</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {submitted ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-5 py-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center"
          >
            <Check size={28} className="text-white" />
          </motion.div>
          <p className="text-base font-bold text-slate-900">Поручение создано</p>
        </div>
      ) : (
        <>
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
              {submitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                >
                  <Clock size={14} />
                </motion.div>
              ) : (
                <ClipboardList size={14} />
              )}
              <span>{submitting ? "Создание..." : "Назначить"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Отмена
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};
