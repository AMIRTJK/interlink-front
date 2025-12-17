import { TASK_STATUS } from "@features/tasks/model";
import PendingIcon from "../../../assets/icons/pending-icon.svg";
import InProgressIcon from "../../../assets/icons/in-progress-icon.svg";
import CompletedIcon from "../../../assets/icons/completed-icon.svg";

export const StatusIcon = ({
  status,
  className,
}: {
  status: string;
  className?: string;
}) => {
  const iconSize = 16;
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return (
        <img
          src={CompletedIcon}
          alt="Completed"
          style={{ width: iconSize, height: iconSize }}
          className={`status-icon-svg ${className}`}
        />
      );
    case TASK_STATUS.IN_PROGRESS:
      return (
        <img
          src={InProgressIcon}
          alt="In Progress"
          style={{ width: iconSize, height: iconSize }}
          className={`status-icon-svg ${className}`}
        />
      );
    case TASK_STATUS.PENDING:
      return (
        <img
          src={PendingIcon}
          alt="Pending"
          style={{ width: iconSize, height: iconSize }}
          className={`status-icon-svg ${className}`}
        />
      );
    default:
      return <span style={{ width: iconSize, height: iconSize }} />;
  }
};
