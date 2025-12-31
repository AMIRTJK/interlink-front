import { useState } from "react";
import { AddTaskForm } from "./AddTaskForm";
import { Modal } from "antd";
import { TasksTable } from "@widgets/tasksTable";
import '../style.css'
import { IAssignee, ITaskItem } from "@widgets/tasksTable/model";
export const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string>();
  const [editingTask, setEditingTask] = useState<ITaskItem | null>(null);

  const handleAddTask = (status: string) => {
    setEditingTask(null);
    setTaskStatus(status);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: ITaskItem) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="profile-page">
      <TasksTable onAddTask={handleAddTask} onTaskClick={handleTaskClick} />
      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        className="modal-task"
        title={null}
        width={376}
        centered
        maskClosable={true}
        closable={false}
      >
        <AddTaskForm
          currentTaskStatus={taskStatus}
          onSuccess={handleCloseModal}
          mode={editingTask ? "edit" : "create"}
          taskId={editingTask?.id}
          initialValues={
            editingTask
              ? {
                  title: editingTask.title,
                  description: editingTask.description,
                  status: editingTask.status,
                  assignees: editingTask.assignees.map((a:IAssignee) => a.id),
                }
              : undefined
          }
        />
      </Modal>
    </div>
  );
};
