import {
  CheckCircleFilled,
  EyeOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Tooltip } from "@shared/ui";
import { Avatar, Button, Checkbox } from "antd";

interface HistoryVersionsTabProps {
  filteredVersions: any[];
  userMap: Map<string, any>;
  activeVersionId?: string | number | null;
  onSelectVersion?: (content: string, versionId: string | number) => void;
  onClose: () => void;
  onSetVersionForSign?: (versionId: string | number) => void;
  isSelectingVersion?: boolean;
  isSigning?: boolean;
  isSignedDocument?: boolean;
  isDarkMode?: boolean;
}

export const HistoryVersionsTab = ({
  filteredVersions,
  userMap,
  activeVersionId,
  onSelectVersion,
  onClose,
  onSetVersionForSign,
  isSelectingVersion,
  isSigning,
  isSignedDocument,
  isDarkMode,
}: HistoryVersionsTabProps) => {
  return (
    <div className="flex flex-col gap-2 h-[60vh]! overflow-y-auto pr-2 custom-scrollbar">
      {filteredVersions.map((v: any) => {
        const author = userMap.get(String(v.authorId)) || {};

        return (
          <div
            key={v.id}
            onClick={() => {
              if (onSelectVersion) {
                onSelectVersion(v.content, v.id);
                onClose();
              }
            }}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group mb-2 ${
              v.id === activeVersionId
                ? isDarkMode
                  ? "bg-th-raised border-th-accent-500 shadow-sm"
                  : "bg-th-accent-50/40 border-th-accent-500 shadow-sm dark:bg-th-accent-900/35"
                : isDarkMode
                  ? "bg-th-raised border-th-high hover:bg-th-raised hover:border-th-accent-500"
                  : "bg-gray-50 border-gray-100 hover:bg-th-accent-50 hover:border-th-accent-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar
                src={author.photo_path}
                icon={<UserOutlined />}
                className={`mt-1! shrink-0! ${
                  isDarkMode ? "bg-th-high!" : "bg-gray-200!"
                }`}
              />
              <div>
                <div
                  className={`font-semibold transition-colors flex gap-1 ${
                    isDarkMode
                      ? "text-gray-200 group-hover:text-th-accent-400"
                      : "text-gray-700 group-hover:text-th-accent-700"
                  }`}
                >
                  <p>Версия {v.versionNumber}</p>
                  {v.approvedCount > 0 && (
                    <Tooltip title={`Согласовали эту версию: ${v.approvedCount}`}>
                      <span
                        className={`px-1.5 rounded text-[10px] font-semibold self-center ${
                          isDarkMode
                            ? "bg-emerald-900/40 text-emerald-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-400"
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
                  {v.is_current_signed && (
                    <Tooltip title="Подписанная версия">
                      <SafetyCertificateOutlined className="text-th-accent-500! text-[13px]!" />
                    </Tooltip>
                  )}
                </div>
                <div
                  className={`text-xs mt-1 font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {author.full_name || "Неизвестный автор"}
                </div>
                <div
                  className={`text-[10px] mt-0.5 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {author.position ? `${author.position} • ` : ""}
                  {new Date(v.date).toLocaleString("ru-RU")}
                </div>
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
                className={`self-center ${
                  isDarkMode
                    ? "text-gray-500 group-hover:text-th-accent-400"
                    : "text-gray-300 group-hover:text-th-accent-500"
                }`}
              >
                <Tooltip title="Восстановить в редакторе">
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    size="small"
                    className={
                      isDarkMode ? "text-gray-400! hover:text-th-accent-400!" : ""
                    }
                  />
                </Tooltip>
              </div>
            </div>
          </div>
        );
      })}
      {filteredVersions.length === 0 && (
        <div className="text-center text-gray-400 py-4">Версии не найдены</div>
      )}
    </div>
  );
};
