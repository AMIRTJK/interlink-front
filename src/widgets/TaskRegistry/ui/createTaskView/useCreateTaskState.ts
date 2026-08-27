import * as React from "react";
import type {
  Attachment,
  BatchRow,
  Colleague,
  Priority,
  SubRow,
  Task,
  TaskPayload,
  TaskStatus,
  TaskType,
} from "../../model/types";
import { toDateInput, toAssigneeIds } from "./createTaskViewModel";

interface IUseCreateTaskStateProps {
  colleagues: Colleague[];
  onCreate: (payloads: TaskPayload[], files?: File[]) => Promise<void>;
  editTask?: Task | null;
  onUpdate?: (id: number, payload: TaskPayload, files?: File[]) => Promise<void>;
}

export function useCreateTaskState({
  colleagues,
  onCreate,
  editTask,
  onUpdate,
}: IUseCreateTaskStateProps) {
  const firstId = colleagues[0]?.id ?? "";
  const isEdit = Boolean(editTask);
  const [isSaving, setIsSaving] = React.useState(false);

  const [newFiles, setNewFiles] = React.useState<File[]>([]);
  const [attachments, setAttachments] = React.useState<Attachment[]>(
    editTask?.attachments ?? [],
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formTitle, setFormTitle] = React.useState(editTask?.title ?? "");
  const [formDescription, setFormDescription] = React.useState(
    editTask?.description ?? "",
  );
  const [formTags, setFormTags] = React.useState(
    editTask?.tags?.join(", ") ?? "",
  );
  const [formPriority, setFormPriority] = React.useState<Priority>(
    editTask?.priority ?? "medium",
  );
  const initialStatus: TaskStatus =
    editTask?.status === "overdue"
      ? "in_progress"
      : editTask?.status ?? "new";

  const [formStatus, setFormStatus] = React.useState<TaskStatus>(initialStatus);
  const [formDueDate, setFormDueDate] = React.useState(
    editTask ? toDateInput(editTask.dueDate) : new Date().toISOString().split("T")[0],
  );
  const [formProgress, setFormProgress] = React.useState<number>(
    editTask?.progress ?? 0,
  );
  const [formAssignees, setFormAssignees] = React.useState<string[]>(
    editTask
      ? editTask.assignees.map((a) => a.id).filter(Boolean)
      : [],
  );
  const [assigneeQuery, setAssigneeQuery] = React.useState("");
  const [assigneeOpen, setAssigneeOpen] = React.useState(false);
  const [titleError, setTitleError] = React.useState(false);
  const [taskType, setTaskType] = React.useState<TaskType>("personal");

  // Protocol state
  const [batchGlobal, setBatchGlobal] = React.useState({
    chairmanId: firstId,
    participants: [] as string[],
    date: new Date().toISOString().split("T")[0],
    number: "",
  });
  const [participantsQuery, setParticipantsQuery] = React.useState("");
  const [participantsOpen, setParticipantsOpen] = React.useState(false);
  const [batchRows, setBatchRows] = React.useState<BatchRow[]>([
    { id: 1, title: "", priority: "medium", status: "new", assigneeId: firstId },
  ]);
  const [subRowsMap, setSubRowsMap] = React.useState<Record<number, SubRow[]>>({});
  const [expandedRows, setExpandedRows] = React.useState<number[]>([]);
  const [chairmanSelectOpen, setChairmanSelectOpen] = React.useState(false);
  const [secretaryId, setSecretaryId] = React.useState<string>("");
  const [secretaryAdding, setSecretaryAdding] = React.useState(false);
  const [secretaryQuery, setSecretaryQuery] = React.useState("");
  const [secretaryOpen, setSecretaryOpen] = React.useState(false);
  const [chairmanSigned, setChairmanSigned] = React.useState<string | null>(null);
  const [secretarySigned, setSecretarySigned] = React.useState<string | null>(null);

  const handleCreateTask = async () => {
    if (!formTitle.trim()) {
      setTitleError(true);
      return;
    }
    if (isSaving) return;
    const safeStatus = formStatus === "overdue" ? "in_progress" : formStatus;
    const payload: TaskPayload = {
      title: formTitle.trim(),
      description: formDescription,
      priority: formPriority,
      status: safeStatus,
      due_date: formDueDate || null,
      tags: formTags.split(",").map((t) => t.trim()).filter((t) => t !== ""),
      progress: formProgress,
      assignees: toAssigneeIds(formAssignees),
    };
    setIsSaving(true);
    try {
      if (isEdit && editTask?.rawId != null && onUpdate) {
        await onUpdate(editTask.rawId, payload, newFiles);
      } else {
        await onCreate([payload], newFiles);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAssignee = (id: string) => {
    setFormAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
    setAssigneeQuery("");
  };

  const filledBatchCount = batchRows.filter((r) => r.title.trim() !== "").length;
  const addBatchRow = () => {
    if (batchRows.length < 20) {
      setBatchRows((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: "",
          priority: "medium",
          status: "new",
          assigneeId: batchGlobal.chairmanId,
        },
      ]);
    }
  };
  const removeBatchRow = (id: number) => {
    if (batchRows.length > 1) {
      setBatchRows((prev) => prev.filter((r) => r.id !== id));
    }
  };
  const updateBatchRow = (id: number, field: keyof BatchRow, value: string) => {
    setBatchRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  const handleBatchCreate = async () => {
    if (isSaving) return;
    const filledRows = batchRows.filter((r) => r.title.trim() !== "");
    if (filledRows.length === 0) return;
    const protocolTag = batchGlobal.number.trim()
      ? `протокол №${batchGlobal.number.trim()}`
      : "протокол";
    const payloads: TaskPayload[] = filledRows.map((row) => {
      const subs = (subRowsMap[row.id] || [])
        .map((s) => s.title.trim())
        .filter(Boolean);
      const description = subs.length
        ? `Подпункты:\n${subs.map((s) => `• ${s}`).join("\n")}`
        : "";
      return {
        title: row.title.trim(),
        description,
        status: row.status,
        priority: row.priority,
        due_date: batchGlobal.date || null,
        tags: ["протокол", protocolTag].filter(
          (t, i, arr) => arr.indexOf(t) === i,
        ),
        progress: 0,
        assignees: toAssigneeIds([row.assigneeId]),
      };
    });
    setIsSaving(true);
    try {
      await onCreate(payloads);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRowExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };
  const addSubRow = (rowId: number) => {
    setSubRowsMap((prev) => ({
      ...prev,
      [rowId]: [
        ...(prev[rowId] || []),
        { id: Date.now() + Math.floor(Math.random() * 1000), title: "" },
      ],
    }));
  };
  const updateSubRow = (rowId: number, subId: number, title: string) => {
    setSubRowsMap((prev) => ({
      ...prev,
      [rowId]: (prev[rowId] || []).map((s) => (s.id === subId ? { ...s, title } : s)),
    }));
  };
  const removeSubRow = (rowId: number, subId: number) => {
    setSubRowsMap((prev) => ({
      ...prev,
      [rowId]: (prev[rowId] || []).filter((s) => s.id !== subId),
    }));
  };

  const toggleParticipant = (id: string) => {
    setBatchGlobal((prev) => ({
      ...prev,
      participants: prev.participants.includes(id)
        ? prev.participants.filter((p) => p !== id)
        : [...prev.participants, id],
    }));
    setParticipantsQuery("");
  };

  return {
    isEdit,
    isSaving,
    newFiles,
    setNewFiles,
    attachments,
    setAttachments,
    fileInputRef,
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    formTags,
    setFormTags,
    formPriority,
    setFormPriority,
    formStatus,
    setFormStatus,
    formDueDate,
    setFormDueDate,
    formProgress,
    setFormProgress,
    formAssignees,
    assigneeQuery,
    setAssigneeQuery,
    assigneeOpen,
    setAssigneeOpen,
    titleError,
    setTitleError,
    taskType,
    setTaskType,
    batchGlobal,
    setBatchGlobal,
    participantsQuery,
    setParticipantsQuery,
    participantsOpen,
    setParticipantsOpen,
    batchRows,
    subRowsMap,
    expandedRows,
    chairmanSelectOpen,
    setChairmanSelectOpen,
    secretaryId,
    setSecretaryId,
    secretaryAdding,
    setSecretaryAdding,
    secretaryQuery,
    setSecretaryQuery,
    secretaryOpen,
    setSecretaryOpen,
    chairmanSigned,
    setChairmanSigned,
    secretarySigned,
    setSecretarySigned,
    handleCreateTask,
    toggleAssignee,
    filledBatchCount,
    addBatchRow,
    removeBatchRow,
    updateBatchRow,
    handleBatchCreate,
    toggleRowExpand,
    addSubRow,
    updateSubRow,
    removeSubRow,
    toggleParticipant,
  };
}
