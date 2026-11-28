import { EyeOutlined, FileTextOutlined } from "@ant-design/icons";

interface HistoryDocumentsTabProps {
  filteredDocs: any[];
  isDarkMode?: boolean;
}

export const HistoryDocumentsTab = ({
  filteredDocs,
  isDarkMode,
}: HistoryDocumentsTabProps) => {
  return (
    <div className="flex flex-col gap-2 h-[60vh]! overflow-y-auto pr-2 custom-scrollbar">
      {filteredDocs.map((doc: any) => (
        <div
          key={doc.id}
          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
            isDarkMode
              ? "bg-th-accent-900/20 border-th-accent-800/50 hover:bg-th-accent-900/40"
              : "bg-th-accent-50/30 border-th-accent-100 hover:bg-th-accent-50 dark:bg-th-accent-900/35 dark:border-th-accent-800/50"
          }`}
        >
          <div className="mt-1 text-th-accent-500">
            <FileTextOutlined />
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span
                className={`font-semibold ${
                  isDarkMode ? "text-th-accent-400" : "text-th-accent-700"
                }`}
              >
                {doc.reg_number}
              </span>
              <span
                className={`text-xs ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {doc.date}
              </span>
            </div>
            <div
              className={`text-sm mt-1 ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {doc.subject}
            </div>
            <div className="mt-2">
              <a
                href={`/modules/correspondence/internal/incoming/${doc.id}`}
                target="_blank"
                rel="noreferrer"
                className={`text-xs hover:underline flex items-center gap-1 ${
                  isDarkMode ? "text-th-accent-400" : "text-th-accent-600"
                }`}
              >
                <EyeOutlined /> Открыть документ
              </a>
            </div>
          </div>
        </div>
      ))}
      {filteredDocs.length === 0 && (
        <div className="text-center text-gray-400 py-4">
          Документы не найдены
        </div>
      )}
    </div>
  );
};
