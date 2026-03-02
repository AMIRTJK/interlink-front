import { ITaskItem } from "../model";
import { getTaskProgressColor, formatDate } from "../lib/utils";
import { StatusIcon } from "./StatusIcon";
import { DeleteOutlined, EditOutlined, UserOutlined, CheckCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { PopConfirm } from "@shared/ui";
import { Button, Avatar, Tooltip } from "antd";
import { useState } from "react";
import { useMutationQuery } from "@shared/lib/hooks";
import { ApiRoutes } from "@shared/api";
import { TASK_STATUS } from "@features/tasks/model";

export const TaskCard = ({
  task,
  onClick,
  onEdit,
  onDelete,
}: {
  task: ITaskItem;
  onClick?: (task: ITaskItem) => void;
  onEdit?: (task: ITaskItem) => void;
  onDelete?: (taskId: string | number) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData("taskId", task.id.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const { mutate: updateStatus } = useMutationQuery<{ status: string }>({
    url: `${ApiRoutes.UPDATE_TASK_STATUS}/${task.id}`,
    method: "PUT",
    messages: {
      success: "Статус задачи обновлен",
      invalidate: [ApiRoutes.GET_TASKS],
    },
  });

  const borderColor = getTaskProgressColor(task.started_at, task.planned_at);
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`task-card-task ${isDragging ? "dragging" : ""}`}
      onClick={() => onClick?.(task)}
      style={{
        borderBottom: `2px solid ${borderColor}`,
      }}
    >
      <div className="task-card-header relative">
        <StatusIcon status={task.status} className="mt-[3px]!" />
        <div className="task-card-content flex justify-between items-start">
            <div className="task__text-content flex-1">
              <p className="task-title pr-6">{task.title}</p>
              <p className="task-desc">{task.description}</p>
              <div className="flex justify-between items-center mt-3">
                <p className="task-datetime">{formatDate(task.created_at)}</p>
                <div className="flex-1 flex justify-end">
                  <Avatar.Group
                    max={{
                      count: 2,
                      style: { color: "#f56a00", backgroundColor: "#fde3cf", fontSize: "10px" },
                    }}
                  >
                    {task.assignees?.length > 0 ? (
                      task.assignees.map((assignee) => (
                        <Tooltip title={String(assignee.full_name || assignee.name || "")} key={assignee.id}>
                          <Avatar
                            src={String(assignee.photo_path || assignee.avatar || <UserOutlined />)}
                            size={24}
                            className="border-white!"
                          >
                            {String(assignee.full_name || assignee.name || "").charAt(0)}
                          </Avatar>
                        </Tooltip>
                      ))
                    ) : (
                      <Tooltip title="Нет участников">
                        <Avatar
                          size={24}
                          icon={<UserOutlined />}
                          className="bg-gray-100! border-gray-200! opacity-40!"
                        />
                      </Tooltip>
                    )}
                  </Avatar.Group>
                </div>
              </div>
            </div>
            <div className="task-card-actions flex flex-col items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Tooltip title={task.status === TASK_STATUS.COMPLETED ? "Возобновить" : "Завершить"}>
                <Button
                  type="text"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newStatus = task.status === TASK_STATUS.COMPLETED ? TASK_STATUS.PENDING : TASK_STATUS.COMPLETED;
                    updateStatus({ status: newStatus });
                  }}
                  icon={
                    task.status === TASK_STATUS.COMPLETED ? (
                      <ReloadOutlined className="text-gray-400! hover:text-orange-500! transition-all! duration-300!" />
                    ) : (
                      <CheckCircleOutlined className="text-gray-300! hover:text-green-500! transition-all! duration-300!" />
                    )
                  }
                />
              </Tooltip>
              <Button
                type="text"
                size="small"
                onClick={() => onEdit?.(task)}
                icon={<EditOutlined className="text-gray-300! hover:text-[#0037AF]! transition-all! duration-300!" />}
              />
              <PopConfirm
                title="Удалить задачу?"
                onConfirm={() => onDelete?.(task.id)}
                placement="topRight"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined className="task-card-delete-btn" />}
                />
              </PopConfirm>
          </div>
          
        </div>
      </div>
    </div>
  );
};
