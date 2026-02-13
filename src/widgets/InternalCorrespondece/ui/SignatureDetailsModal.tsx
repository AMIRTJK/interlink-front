import {
  CheckCircleFilled,
  ClockCircleFilled,
  KeyOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Divider, Modal, Typography } from "antd";

const { Paragraph } = Typography;

export const SignatureDetailsModal = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}) => {
  if (!data) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2 text-green-600">
          <SafetyCertificateOutlined className="text-xl!" />
          <span>Электронная цифровая подпись</span>
        </div>
      }
      centered
      width={500}
    >
      <div className="flex flex-col gap-4 py-2">
        {/* Блок пользователя */}
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <Avatar
            src={data.user?.photo_path}
            size="large"
            icon={<UserOutlined />}
          />
          <div>
            <div className="font-semibold text-gray-800">
              {data.user?.full_name}
            </div>
            <div className="text-xs text-gray-500">{data.user?.position}</div>
          </div>
        </div>

        <Divider className="my-1!" />

        {/* Технические данные */}
        <div className="space-y-3">
          <div>
            <div className=" text-gray-400 font-semibold mb-1 flex items-center gap-1">
              <ClockCircleFilled /> Дата и время подписания
            </div>
            <div className="text-sm font-medium text-gray-700">
              {data.signed_at
                ? new Date(data.signed_at).toLocaleString("ru-RU")
                : "Нет данных"}
            </div>
          </div>

          <div>
            <div className=" text-gray-400 font-semibold mb-1 flex items-center gap-1">
              <KeyOutlined /> Payload Hash (Отпечаток)
            </div>
            <div className="bg-gray-100 p-2 rounded border border-gray-200">
              <Paragraph
                copyable={{ tooltips: ["Копировать", "Скопировано!"] }}
                className="mb-0! font-mono! text-xs! text-gray-600! break-all!"
              >
                {data.payload_hash || "hash_not_found"}
              </Paragraph>
            </div>
            <div className="text-[10px] text-gray-400 mt-1">
              Уникальный криптографический отпечаток данных на момент подписи.
            </div>
          </div>

          {data.nonce && (
            <div>
              <div className=" text-gray-400  font-semibold mb-1">
                Nonce (Уникальный токен сессии)
              </div>
              <Paragraph
                copyable
                className="mb-0! font-mono! text-xs! text-gray-500! break-all!"
              >
                {data.nonce}
              </Paragraph>
            </div>
          )}
        </div>

        {/* Статус валидности */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircleFilled className="text-green-500! text-lg!" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-green-700">
              Подпись валидна
            </div>
            <div className="text-xs text-green-600">
              Целостность данных подтверждена сервером.
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
