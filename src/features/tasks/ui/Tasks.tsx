import { useState } from "react";
import { AddTaskForm } from "./AddTaskForm";
import { Modal } from "antd";
import { TasksTable, ITaskItem } from "@widgets/tasksTable";
import '../style.css'
export const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskStatus, setTaskStatus] = useState<string>();

  const handleAddTask = (status: string) => {
    setTaskStatus(status);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: ITaskItem) => {
    console.log("Task clicked:", task);
  };

  return (
    <div className="profile-page">
      <TasksTable onAddTask={handleAddTask} onTaskClick={handleTaskClick} />
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
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
          onSuccess={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
