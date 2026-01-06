import { Modal } from "antd";
import { AddTaskForm } from "@features/tasks";
import { Dayjs } from "dayjs";
import "./task-details-modal.css";
interface IProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateTime?: { date: Dayjs; time: Dayjs } | null;
  initialValues?: unknown; 
  onSuccess: () => void;
  mode?: 'create' | 'edit';
  eventId?: string;
}

export const CreateTaskModal = ({
  isOpen,
  onClose,
  selectedDateTime,
  initialValues,
  onSuccess,
  mode = 'create',
  eventId,
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
      closable={true}
    >
      <div className="task-details">
        <AddTaskForm
          initialValues={
            initialValues || (selectedDateTime
              ? {
                  date: selectedDateTime.date,
                  time: selectedDateTime.time,
                }
              : undefined)
          }
          onSuccess={onSuccess}
          isEvent={true}
          mode={mode}
          eventId={eventId}
        />
      </div>
    </Modal>
  );
};
