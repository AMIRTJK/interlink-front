import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Colleague, Task, TaskPayload } from "../model/types";
import { useCreateTaskState } from "./createTaskView/useCreateTaskState";
import { CreateTaskHeader } from "./createTaskView/CreateTaskHeader";
import { PersonalTaskForm } from "./createTaskView/PersonalTaskForm";
import { ProtocolTaskForm } from "./createTaskView/ProtocolTaskForm";

interface CreateTaskViewProps {
  colleagues: Colleague[];
  onBack: () => void;
  onCreate: (payloads: TaskPayload[], files?: File[]) => Promise<void>;
  editTask?: Task | null;
  onUpdate?: (
    id: number,
    payload: TaskPayload,
    files?: File[],
  ) => Promise<void>;
  onDownloadAttachment?: (
    taskId: number,
    attachmentId: number,
    fileName: string,
  ) => Promise<void> | void;
  onDeleteAttachment?: (
    taskId: number,
    attachmentId: number,
  ) => Promise<void> | void;
}

export const CreateTaskView = ({
  colleagues,
  onBack,
  onCreate,
  editTask,
  onUpdate,
  onDownloadAttachment,
  onDeleteAttachment,
}: CreateTaskViewProps) => {
  const {
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
  } = useCreateTaskState({
    colleagues,
    onCreate,
    editTask,
    onUpdate,
  });

  return (
    <motion.main
      key="create"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="w-full pb-10 relative z-10 flex flex-col gap-8 min-h-screen"
    >
      <CreateTaskHeader
        onBack={onBack}
        isEdit={isEdit}
        isSaving={isSaving}
        onSave={taskType === "personal" ? handleCreateTask : handleBatchCreate}
        taskType={taskType}
        onTaskTypeChange={setTaskType}
      />

      <AnimatePresence mode="wait">
        {taskType === "personal" ? (
          <PersonalTaskForm
            formTitle={formTitle}
            onFormTitleChange={setFormTitle}
            titleError={titleError}
            onClearTitleError={() => setTitleError(false)}
            formDescription={formDescription}
            onFormDescriptionChange={setFormDescription}
            formTags={formTags}
            onFormTagsChange={setFormTags}
            attachments={attachments}
            onRemoveAttachment={(id) =>
              setAttachments((prev) =>
                prev.filter((a) => String(a.id) !== String(id)),
              )
            }
            newFiles={newFiles}
            onRemoveNewFile={(index) =>
              setNewFiles((prev) => prev.filter((_, i) => i !== index))
            }
            onAddNewFiles={(files) =>
              setNewFiles((prev) => [...prev, ...files])
            }
            fileInputRef={fileInputRef}
            editTask={editTask}
            onDownloadAttachment={onDownloadAttachment}
            onDeleteAttachment={onDeleteAttachment}
            formPriority={formPriority}
            onFormPriorityChange={setFormPriority}
            formStatus={formStatus}
            onFormStatusChange={setFormStatus}
            formDueDate={formDueDate}
            onFormDueDateChange={setFormDueDate}
            formProgress={formProgress}
            onFormProgressChange={setFormProgress}
            formAssignees={formAssignees}
            onToggleAssignee={toggleAssignee}
            assigneeQuery={assigneeQuery}
            onAssigneeQueryChange={setAssigneeQuery}
            assigneeOpen={assigneeOpen}
            onAssigneeOpenChange={setAssigneeOpen}
            colleagues={colleagues}
            onSave={handleCreateTask}
            isSaving={isSaving}
          />
        ) : (
          <ProtocolTaskForm
            colleagues={colleagues}
            batchGlobal={batchGlobal}
            onBatchGlobalChange={setBatchGlobal}
            participantsQuery={participantsQuery}
            onParticipantsQueryChange={setParticipantsQuery}
            participantsOpen={participantsOpen}
            onParticipantsOpenChange={setParticipantsOpen}
            onToggleParticipant={toggleParticipant}
            batchRows={batchRows}
            onAddBatchRow={addBatchRow}
            onRemoveBatchRow={removeBatchRow}
            onUpdateBatchRow={updateBatchRow}
            subRowsMap={subRowsMap}
            expandedRows={expandedRows}
            onToggleRowExpand={toggleRowExpand}
            onAddSubRow={addSubRow}
            onUpdateSubRow={updateSubRow}
            onRemoveSubRow={removeSubRow}
            chairmanSelectOpen={chairmanSelectOpen}
            onChairmanSelectOpenChange={setChairmanSelectOpen}
            secretaryId={secretaryId}
            onSecretaryIdChange={setSecretaryId}
            secretaryAdding={secretaryAdding}
            onSecretaryAddingChange={setSecretaryAdding}
            secretaryQuery={secretaryQuery}
            onSecretaryQueryChange={setSecretaryQuery}
            secretaryOpen={secretaryOpen}
            onSecretaryOpenChange={setSecretaryOpen}
            chairmanSigned={chairmanSigned}
            onChairmanSignedChange={setChairmanSigned}
            secretarySigned={secretarySigned}
            onSecretarySignedChange={setSecretarySigned}
            filledBatchCount={filledBatchCount}
            isSaving={isSaving}
            onBatchCreate={handleBatchCreate}
          />
        )}
      </AnimatePresence>
    </motion.main>
  );
};
