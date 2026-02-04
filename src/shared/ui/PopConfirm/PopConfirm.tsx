import { Popconfirm } from "antd";
import { TooltipPlacement } from "antd/es/tooltip";

export interface IPopConfirmProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  children: React.ReactNode;
  placement?: TooltipPlacement;
}

export const PopConfirm = ({
  title,
  description,
  onConfirm,
  onCancel,
  okText = "Да",
  cancelText = "Нет",
  children,
  placement = "topRight",
}: IPopConfirmProps) => {
  return (
    <Popconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      placement={placement}
    >
      {children}
    </Popconfirm>
  );
};
