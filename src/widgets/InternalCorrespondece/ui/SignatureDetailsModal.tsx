import {
  CheckCircleFilled,
  ClockCircleFilled,
  KeyOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Divider,
  Modal,
  Typography,
  ConfigProvider,
  theme,
} from "antd";

const { Paragraph } = Typography;

export const SignatureDetailsModal = ({
  isOpen,
  onClose,
  data,
  isDarkMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  isDarkMode: boolean;
}) => {
  if (!data) return null;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        title={
          <div
            className={`flex items-center gap-2 ${isDarkMode ? "text-green-500" : "text-green-600"}`}
          >
            <SafetyCertificateOutlined className="text-xl!" />
            <span>Электронная цифровая подпись</span>
          </div>
        }
        centered
        width={500}
        zIndex={2000}
      >
        <div className="flex flex-col gap-4 py-2">
          {/* Блок пользователя */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isDarkMode ? "bg-[#1f2937] border-gray-700" : "bg-gray-50 border-gray-100"}`}
          >
            <Avatar
              src={data.user?.photo_path}
              size="large"
              icon={<UserOutlined />}
              className={isDarkMode ? "bg-gray-700!" : ""}
            />
            <div>
              <div
                className={`font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                {data.user?.full_name}
              </div>
              <div
                className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                {data.user?.position}
              </div>
            </div>
          </div>

          <Divider
            className={`my-1! ${isDarkMode ? "border-gray-700!" : ""}`}
          />

          {/* Технические данные */}
          <div className="space-y-3">
            <div>
              <div
                className={`font-semibold mb-1 flex items-center gap-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
              >
                <ClockCircleFilled /> Дата и время подписания
              </div>
              <div
                className={`text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                {data.signed_at
                  ? new Date(data.signed_at).toLocaleString("ru-RU")
                  : "Нет данных"}
              </div>
            </div>

            <div>
              <div
                className={`font-semibold mb-1 flex items-center gap-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
              >
                <KeyOutlined /> Payload Hash (Отпечаток)
              </div>
              <div
                className={`p-2 rounded border transition-colors ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}
              >
                <Paragraph
                  copyable={{ tooltips: ["Копировать", "Скопировано!"] }}
                  className={`mb-0! font-mono! text-xs! break-all! ${isDarkMode ? "text-gray-400!" : "text-gray-600!"}`}
                >
                  {data.payload_hash || "hash_not_found"}
                </Paragraph>
              </div>
              <div
                className={`text-[10px] mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
              >
                Уникальный криптографический отпечаток данных на момент подписи.
              </div>
            </div>

            {data.nonce && (
              <div>
                <div
                  className={`font-semibold mb-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
                >
                  Nonce (Уникальный токен сессии)
                </div>
                <Paragraph
                  copyable
                  className={`mb-0! font-mono! text-xs! break-all! ${isDarkMode ? "text-gray-500!" : "text-gray-500!"}`}
                >
                  {data.nonce}
                </Paragraph>
              </div>
            )}
          </div>

          {/* Статус валидности */}
          <div
            className={`border rounded-lg p-3 flex items-center gap-2 transition-colors ${isDarkMode ? "bg-[#00c9501a] border-green-900/50" : "bg-green-50 border-green-200"}`}
          >
            <CheckCircleFilled className="text-green-500! text-lg!" />
            <div className="flex-1">
              <div
                className={`text-sm font-semibold ${isDarkMode ? "text-green-500" : "text-green-700"}`}
              >
                Подпись валидна
              </div>
              <div
                className={`text-xs ${isDarkMode ? "text-green-600/80" : "text-green-600"}`}
              >
                Целостность данных подтверждена сервером.
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};
