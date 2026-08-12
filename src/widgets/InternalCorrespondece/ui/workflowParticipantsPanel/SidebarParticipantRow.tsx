import { SafetyCertificateOutlined, UserOutlined } from "@ant-design/icons";
import {
  ApprovalVersionBadge,
  IApprovalVersionSummary,
  resolveApprovalVersionId,
  resolveApprovalVersionLabel,
} from "@entities/correspondence";
import { If, Tooltip } from "@shared/ui";
import { Avatar, Button } from "antd";
import { getStatusMeta } from "./workflowParticipantsModel";

interface SidebarParticipantRowProps {
  item: any;
  role: "signer" | "approver";
  isCollapsed?: boolean;
  isDarkMode?: boolean;
  currentUserId: string | number | null;
  openSignatureModal: (e: React.MouseEvent, item: any) => void;
  onSign?: () => void;
  handleOpenApproveModal?: () => void;
  isSigning?: boolean;
  isReadOnly?: boolean;
  hasQRInSelectedVersion?: boolean;
  approvalVersionSummary?: IApprovalVersionSummary | null;
  activeVersionId?: string | number | null;
}

export const SidebarParticipantRow = ({
  item,
  role,
  isCollapsed,
  isDarkMode,
  currentUserId,
  openSignatureModal,
  onSign,
  handleOpenApproveModal,
  isSigning,
  isReadOnly,
  hasQRInSelectedVersion,
  approvalVersionSummary,
  activeVersionId,
}: SidebarParticipantRowProps) => {
  const user = item.user || {};
  const fullName = user.full_name || "Пользователь";
  const position = user.position || "Сотрудник";
  const status = item.status || "Ожидание";
  const meta = getStatusMeta(status, isDarkMode);

  const isCurrentUser = String(user.id) === String(currentUserId);
  const isPending = status === "pending";

  const hasSignature =
    (status === "signed" || status === "approved") && item.payload_hash;

  const approvedVersionLabel =
    role === "approver"
      ? resolveApprovalVersionLabel(item, approvalVersionSummary)
      : null;

  const approvedVersionId = approvedVersionLabel
    ? resolveApprovalVersionId(item, approvalVersionSummary)
    : null;

  const isVersionMismatch =
    approvedVersionId != null &&
    activeVersionId != null &&
    String(approvedVersionId) !== String(activeVersionId);

  if (isCollapsed) {
    return (
      <Tooltip
        title={`${fullName} - ${status}`}
        placement="left"
        key={item.id}
      >
        <div className="relative mb-3 flex justify-center z-10">
          <Avatar
            src={user.photo_path}
            icon={<UserOutlined />}
            size="small"
            className={isDarkMode ? "bg-gray-700!" : "bg-gray-200!"}
          />
          <div
            className={`absolute -top-1 -right-1 rounded-full leading-[0] ${meta.bg} text-[10px]`}
          >
            {meta.icon}
          </div>
        </div>
      </Tooltip>
    );
  }

  return (
    <div
      className={`relative flex gap-3 group items-center mb-4 p-2 rounded-xl ${meta.bgList}`}
    >
      <div className="relative z-10 shrink-0">
        <Avatar
          src={user.photo_path}
          icon={<UserOutlined />}
          className={`transition-colors! ${
            status === "pending" ? "grayscale-[0.5]! opacity-70!" : ""
          }`}
        />
        <div
          className={`absolute -top-1 -right-1 rounded-full border leading-[0] ${
            meta.bg
          } ${isDarkMode ? "border-[#111827]" : "border-white"}`}
        >
          {meta.icon}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <span
            className={`text-sm font-medium break-words pr-2 ${
              status === "pending"
                ? isDarkMode
                  ? "text-gray-500"
                  : "text-gray-500"
                : isDarkMode
                  ? "text-gray-200"
                  : "text-gray-800"
            }`}
          >
            {fullName}
            <If is={isCurrentUser}>
              <span className="text-blue-500 text-xs ml-1 font-normal">
                (Вы)
              </span>
            </If>
          </span>
          <If is={hasSignature}>
            <Tooltip title="Показать ЭЦП">
              <div
                onClick={(e) => openSignatureModal(e, item)}
                className={`${
                  isDarkMode ? "text-green-500!" : "text-green-600!"
                } cursor-pointer h-[20px]! w-[20px]! flex items-center justify-center rounded-full`}
              >
                <SafetyCertificateOutlined />
              </div>
            </Tooltip>
          </If>
        </div>
        <div className="text-xs text-gray-400 break-words mt-0.5">
          {position}
        </div>

        <If is={!!approvedVersionLabel}>
          <div className="mt-1">
            <ApprovalVersionBadge
              label={approvedVersionLabel}
              isMismatch={isVersionMismatch}
              isDarkMode={isDarkMode}
            />
          </div>
        </If>

        <If is={status === "declined"}>
          <div className="text-xs text-red-500 font-semibold mt-1">
            Отклонил право подписи
            <If is={Boolean(item.decline_reason || item.reason)}>
              <span className="block text-[11px] text-red-400 font-normal italic mt-0.5">
                Причина: {item.decline_reason || item.reason}
              </span>
            </If>
          </div>
        </If>

        <div className="mt-2">
          {role === "signer" && isCurrentUser && isPending && (
            <Tooltip
              title={
                !hasQRInSelectedVersion
                  ? "Сначала добавьте QR-код в версию для подписи"
                  : ""
              }
              placement="bottom"
            >
              <div>
                <Button
                  htmlType="button"
                  onClick={onSign}
                  loading={isSigning}
                  disabled={status !== "pending" || !hasQRInSelectedVersion}
                  type="primary"
                  size="small"
                  className={`${
                    status !== "pending" || isReadOnly || !hasQRInSelectedVersion
                      ? isDarkMode
                        ? "bg-gray-700 text-gray-500"
                        : "bg-[#f0f1f3]"
                      : "bg-blue-600! hover:bg-blue-500!"
                  }`}
                >
                  Подписать
                </Button>
              </div>
            </Tooltip>
          )}
          {role === "approver" && isCurrentUser && isPending && (
            <Button
              onClick={handleOpenApproveModal}
              disabled={status !== "pending" || isReadOnly}
              loading={isSigning}
              type="primary"
              size="small"
              className={`${
                status !== "pending" || isReadOnly
                  ? isDarkMode
                    ? "bg-gray-700 text-gray-500"
                    : "bg-[#f0f1f3]"
                  : "bg-blue-600! hover:bg-blue-500!"
              }`}
            >
              Согласовать
            </Button>
          )}
        </div>
        <If is={Boolean(item.note)}>
          <div
            className={`mt-2 p-2 rounded-lg text-xs leading-relaxed border ${
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
      </div>
    </div>
  );
};
