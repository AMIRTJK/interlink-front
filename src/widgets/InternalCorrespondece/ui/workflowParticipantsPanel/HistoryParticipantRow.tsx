import {
  CheckCircleFilled,
  DownOutlined,
  EyeOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  UpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { If, Tooltip } from "@shared/ui";
import { Avatar, Button, Checkbox, Tag } from "antd";
import { getStatusTagConfig } from "./workflowParticipantsModel";

interface HistoryParticipantRowProps {
  item: any;
  type: "signer" | "approver" | "creator";
  currentUserId: string | number | null;
  versionsWithMeta: any[];
  isExpanded: boolean;
  toggleRow: (id: string) => void;
  onShowSignature: (e: any, item: any) => void;
  onSign: () => void;
  handleOpenApproveModal: () => void;
  isSigning: boolean;
  isReadOnly: boolean;
  isDarkMode?: boolean;
  onSelectVersion?: (content: string, versionId: string | number) => void;
  onClose: () => void;
  activeVersionId?: string | number | null;
  onSetVersionForSign?: (versionId: string | number) => void;
  isSelectingVersion?: boolean;
  isSignedDocument?: boolean;
}

export const HistoryParticipantRow = ({
  item,
  type,
  currentUserId,
  versionsWithMeta,
  isExpanded,
  toggleRow,
  onShowSignature,
  onSign,
  handleOpenApproveModal,
  isSigning,
  isReadOnly,
  isDarkMode,
  onSelectVersion,
  onClose,
  activeVersionId,
  onSetVersionForSign,
  isSelectingVersion,
  isSignedDocument,
}: HistoryParticipantRowProps) => {
  const isCurrentUser = String(item.user?.id) === String(currentUserId);
  const isPending = item.status === "pending";

  const hasSignature =
    (item.status === "signed" || item.status === "approved") &&
    item.payload_hash;

  const userVersions = versionsWithMeta.filter(
    (v) => String(v.authorId) === String(item.user?.id),
  );

  const statusConfig = getStatusTagConfig(item.status);

  return (
    <div key={item.id} className="mb-2">
      <div
        className={`flex items-start justify-between p-3 rounded-lg border transition-all relative z-10 ${
          isDarkMode
            ? "bg-[#1f2937] border-gray-700 hover:bg-gray-800"
            : "bg-gray-50 border-gray-100 hover:bg-white hover:shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <Avatar src={item.user?.photo_path} icon={<UserOutlined />} />
          <div>
            <div
              className={`font-medium flex items-center gap-2 ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {item.user?.full_name}
              <If is={hasSignature}>
                <Tooltip title="Показать данные ЭЦП">
                  <Button
                    type="text"
                    size="small"
                    className={`h-[20px]! w-[20px]! flex items-center justify-center rounded-full ${
                      isDarkMode
                        ? "text-green-400! bg-green-900/30!"
                        : "text-green-600! bg-green-50!"
                    }`}
                    onClick={(e) => onShowSignature(e, item)}
                    icon={
                      <SafetyCertificateOutlined className="text-[12px]!" />
                    }
                  />
                </Tooltip>
              </If>
              <If is={isCurrentUser}>
                <span className="text-gray-400 text-xs ml-1">(Вы)</span>
              </If>
            </div>
            <div
              className={`text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {item.user?.position}
            </div>
            <If is={userVersions.length > 0}>
              <div
                className={`mt-1 flex items-center gap-1 text-[11px] font-medium cursor-pointer select-none transition-colors ${
                  isDarkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-500 hover:text-blue-600"
                }`}
                onClick={() => toggleRow(item.id)}
              >
                <HistoryOutlined />
                {userVersions.length}{" "}
                {userVersions.length === 1
                  ? "версия"
                  : userVersions.length < 5
                    ? "версии"
                    : "версий"}
                {isExpanded ? (
                  <UpOutlined className="text-[9px]! ml-0.5!" />
                ) : (
                  <DownOutlined className="text-[9px]! ml-0.5!" />
                )}
              </div>
            </If>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div>
            <Tag color={statusConfig.color}>{statusConfig.text}</Tag>
          </div>

          {type === "signer" && isCurrentUser && isPending && (
            <Button
              htmlType="button"
              onClick={onSign}
              loading={isSigning}
              disabled={item.status !== "pending"}
              type="primary"
              size="small"
              className={`bg-blue-600! hover:bg-blue-500! ${
                item.status !== "pending" ? "text-white! opacity-50!" : ""
              }`}
            >
              Подписать
            </Button>
          )}

          {type === "approver" && isCurrentUser && isPending && (
            <Button
              htmlType="button"
              type="primary"
              size="small"
              onClick={handleOpenApproveModal}
              loading={isSigning}
              disabled={item.status !== "pending" || isReadOnly}
              className="bg-green-600! hover:bg-green-500! border-green-600!"
            >
              Согласовать
            </Button>
          )}
        </div>
      </div>

      <If is={Boolean(item.note)}>
        <div
          className={`mt-1.5 mx-3 p-2 rounded-lg text-xs leading-relaxed border ${
            isDarkMode
              ? "bg-amber-950/30 border-amber-800/50 text-amber-200"
              : "bg-amber-50/80 border-amber-200/80 text-amber-900"
          }`}
        >
          <span className="font-semibold block mb-0.5 text-[11px] opacity-80">
            💬 Комментарий:
          </span>
          {item.note}
        </div>
      </If>

      {isExpanded && userVersions.length > 0 && (
        <div
          className={`pl-[52px] pr-2 py-2 flex flex-col gap-2 border-l-2 ml-[22px] -mt-1 rounded-b-lg ${
            isDarkMode
              ? "border-blue-900/50 bg-[#1f2937]/50"
              : "border-blue-100 bg-white/50"
          }`}
        >
          {userVersions.map((v) => (
            <div
              key={v.id}
              onClick={() => {
                if (onSelectVersion) {
                  onSelectVersion(v.content, v.id);
                  onClose();
                }
              }}
              className={`flex items-center justify-between p-2 rounded border cursor-pointer group transition-all ${
                v.id === activeVersionId
                  ? isDarkMode
                    ? "bg-gray-800 border-blue-500 shadow-sm shadow-blue-900/30"
                    : "bg-blue-50/50 border-blue-500 shadow-sm shadow-blue-100"
                  : isDarkMode
                    ? "bg-gray-800 border-gray-700 hover:border-blue-500"
                    : "bg-white border-gray-100 hover:border-blue-300 hover:shadow-sm"
              }`}
            >
              <div>
                <div
                  className={`text-xs font-semibold transition-colors flex gap-1 ${
                    isDarkMode
                      ? "text-gray-300 group-hover:text-blue-400"
                      : "text-gray-700 group-hover:text-blue-600"
                  }`}
                >
                  <p>Версия {v.versionNumber}</p>
                  {v.is_selected && (
                    <Tooltip title="Выбрана для подписи">
                      <CheckCircleFilled className="text-green-500! text-[12px]!" />
                    </Tooltip>
                  )}
                </div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {new Date(v.date).toLocaleString("ru-RU")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={v.is_selected}
                    onChange={() =>
                      onSetVersionForSign && onSetVersionForSign(v.id)
                    }
                    disabled={
                      isSelectingVersion || isSigning || isSignedDocument
                    }
                  >
                    <span
                      className={`text-xs select-none ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Для подписи
                    </span>
                  </Checkbox>
                </div>
                <div
                  className={`${
                    isDarkMode
                      ? "text-gray-500 group-hover:text-blue-400"
                      : "text-gray-300 group-hover:text-blue-500"
                  }`}
                >
                  <Tooltip title="Восстановить в редакторе">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      size="small"
                      className={
                        isDarkMode
                          ? "text-gray-400! hover:text-blue-400!"
                          : ""
                      }
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
