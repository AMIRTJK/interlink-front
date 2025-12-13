import { Modal } from "antd";
import { AddTaskForm } from "@features/tasks";
import { Dayjs } from "dayjs";
import "./task-details-modal.css"; 
interface IProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateTime: { date: Dayjs; time: Dayjs } | null;
  onSuccess: () => void;
}

export const CreateTaskModal = ({
  isOpen,
  onClose,
  selectedDateTime,
  onSuccess,
}: IProps) => {
  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="task-details-modal" 
    >
      <div className="task-details">
        <div className="task-details__header-bg">
          <h2 className="task-details__title">Наименование события</h2>
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
