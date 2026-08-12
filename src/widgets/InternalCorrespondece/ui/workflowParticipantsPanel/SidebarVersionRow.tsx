import {
  CheckCircleFilled,
  CloseCircleFilled,
  EyeOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Tooltip } from "@shared/ui";
import { Avatar, Checkbox, ConfigProvider, theme } from "antd";

interface SidebarVersionRowProps {
  version: any;
  author: any;
  activeVersionId?: string | number | null;
  onSelectVersion?: (content: string, versionId: string | number) => void;
  onSetVersionForSign?: (versionId: string | number) => void;
  isSelectingVersion?: boolean;
  isSigning?: boolean;
  isSignedDocument?: boolean;
  isDarkMode?: boolean;
}

export const SidebarVersionRow = ({
  version: v,
  author,
  activeVersionId,
  onSelectVersion,
  onSetVersionForSign,
  isSelectingVersion,
  isSigning,
  isSignedDocument,
  isDarkMode,
}: SidebarVersionRowProps) => {
  return (
    <div
      key={v.id}
      onClick={() => onSelectVersion && onSelectVersion(v.content, v.id)}
      className={`flex items-start gap-3 p-2 rounded-lg border transition-all cursor-pointer group ${
        v.id === activeVersionId
          ? isDarkMode
            ? "bg-[#1f2937] border-blue-500 shadow-sm"
            : "bg-blue-50/40 border-blue-500 shadow-sm"
          : isDarkMode
            ? "bg-[#1f2937] border-gray-700 hover:bg-gray-800 hover:border-blue-500"
            : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-blue-300"
      }`}
    >
      <Avatar
        src={author.photo_path}
        icon={<UserOutlined />}
        size="small"
        className={`mt-0.5 shrink-0 ${
          isDarkMode ? "bg-gray-600!" : "bg-gray-200!"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div
          className={`text-xs font-semibold flex gap-1 transition-colors ${
            isDarkMode
              ? "text-gray-200 group-hover:text-blue-400"
              : "text-gray-700 group-hover:text-blue-600"
          }`}
        >
          <p>Версия {v.displayVersion}</p>
          {v.approvedCount > 0 && (
            <Tooltip title={`Согласовали эту версию: ${v.approvedCount}`}>
              <span
                className={`px-1 rounded text-[9px] font-semibold self-center ${
                  isDarkMode
                    ? "bg-emerald-900/40 text-emerald-300"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                ✓ {v.approvedCount}
              </span>
            </Tooltip>
          )}
          {v.is_selected && (
            <Tooltip title="Выбрана для подписи">
              <CheckCircleFilled className="text-green-500! text-[12px]!" />
            </Tooltip>
          )}
          {v.signature_state === "revoked" ? (
            <Tooltip title="Подпись отменена">
              <CloseCircleFilled className="text-red-500! text-[13px]!" />
            </Tooltip>
          ) : (
            v.is_current_signed && (
              <Tooltip title="Подписанная версия">
                <SafetyCertificateOutlined className="text-blue-500! text-[13px]!" />
              </Tooltip>
            )
          )}
        </div>
        <Tooltip title={author.full_name || "Неизвестный автор"}>
          <div
            className={`text-[10px] font-medium truncate mt-0.5 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {author.full_name || "Неизвестный автор"}
          </div>
        </Tooltip>
        <div className="text-[9px] text-gray-400 mt-0.5">
          {new Date(v.date).toLocaleString("ru-RU")}
        </div>
      </div>
      <div className={`flex items-center mt-2 shrink-0 gap-2`}>
        <div onClick={(e) => e.stopPropagation()}>
          <ConfigProvider
            theme={{
              algorithm: isDarkMode
                ? theme.darkAlgorithm
                : theme.defaultAlgorithm,
            }}
          >
            <Checkbox
              checked={v.is_selected}
              onChange={() =>
                onSetVersionForSign && onSetVersionForSign(v.id)
              }
              disabled={
                isSelectingVersion || isSigning || isSignedDocument
              }
            />
          </ConfigProvider>
        </div>
        <div
          className={`${
            isDarkMode
              ? "text-gray-500 hover:text-blue-400"
              : "text-gray-400 hover:text-blue-500"
          }`}
        >
          <Tooltip title="Восстановить в редакторе">
            <EyeOutlined />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
