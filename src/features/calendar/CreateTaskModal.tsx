import { Modal } from "antd";
import { AddTaskForm } from "@features/tasks";
import { Dayjs } from "dayjs";
import "./task-details-modal.css"; // Reusing the css for consistency

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateTime: { date: Dayjs; time: Dayjs } | null;
  platform?: "jira" | "google"; // Assumed from context, though not strictly used in the form yet based on previous file content
  onSuccess: () => void;
}

export const CreateTaskModal = ({
  isOpen,
  onClose,
  selectedDateTime,
  onSuccess,
}: CreateTaskModalProps) => {
  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="task-details-modal" // Reusing style class
    >
      <div className="task-details">
        <div className="task-details__header-bg">
          <h2 className="task-details__title">Добавить задачу</h2>
        </div>
        <div className="task-details__content">
          <AddTaskForm
            initialValues={
              selectedDateTime
                ? {
                    date: selectedDateTime.date,
                    time: selectedDateTime.time,
                  }
                : undefined
            }
            onSuccess={onSuccess}
            isEvent={true}
          />
        </div>
      </div>
    </Modal>
  );
};
