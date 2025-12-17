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
      width={376}
      centered
      className="task-details-modal"
      maskClosable={true}
      closable={false}
    >
      <div className="task-details">
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
    </Modal>
  );
};
