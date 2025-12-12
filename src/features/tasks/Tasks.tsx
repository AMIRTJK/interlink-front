import { useState } from "react";
import { AddTaskForm } from "./AddTaskForm";
import { Modal } from "antd";
import { TasksTable, ITaskItem } from "@widgets/tasksTable";

export const Tasks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTask = () => {
    setIsModalOpen(true);
  };

  const handleTaskClick = (task: ITaskItem) => {
    console.log("Task clicked:", task);
  };

  return (
    <div className="profile-page">
      <TasksTable
        onAddTask={handleAddTask}
        onTaskClick={handleTaskClick}
      />
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        title="Добавить задачу"
        destroyOnClose
      >
        <AddTaskForm />
      </Modal>
    </div>
  );
};
