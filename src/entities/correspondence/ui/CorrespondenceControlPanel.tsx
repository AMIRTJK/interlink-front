import React from "react";
import { Button, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  SendOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface CorrespondenceControlPanelProps {
  isSaving?: boolean;
  isAllowed?: boolean;
  onSave: () => void;
  onResolution: () => void;
  onReject?: () => void;
  onComplete?: () => void;
}

export const CorrespondenceControlPanel: React.FC<
  CorrespondenceControlPanelProps
> = ({
  isSaving,
  isAllowed = true,
  onSave,
  onResolution,
  onReject,
  onComplete,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-200 pb-6 flex items-center justify-between sticky top-0 z-10 mb-6">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined className="text-lg" />}
          onClick={() => navigate(-1)}
          className="hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center text-gray-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <Tooltip title="Отклонить документ">
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={onReject}
            className="rounded-lg! border-red-200! text-red-600! hover:bg-red-50! hover:border-red-300! h-9! px-6! font-medium!"
          >
            Отклонить
          </Button>
        </Tooltip>

        <Tooltip title="Отправить на резолюцию">
          <Button
            icon={<SendOutlined />}
            onClick={onResolution}
            className="rounded-lg! border-purple-200! text-purple-700! hover:bg-purple-50! hover:border-purple-300! h-9! px-6! font-medium!"
          >
            На резолюцию
          </Button>
        </Tooltip>

        <Tooltip title="Завершить исполнение">
          <Button
            icon={<CheckCircleOutlined />}
            onClick={onComplete}
            className="rounded-lg! border-green-200! text-green-700! hover:bg-green-50! hover:border-green-300! h-9! px-6! font-medium!"
          >
            Завершить
          </Button>
        </Tooltip>

        <div className="w-px h-8 bg-gray-200 mx-1"></div>

        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving || !isAllowed}
          onClick={onSave}
          className="bg-[#0037AF]! hover:bg-[#002D93]! border-none! rounded-lg h-9! px-6! font-medium!"
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};
