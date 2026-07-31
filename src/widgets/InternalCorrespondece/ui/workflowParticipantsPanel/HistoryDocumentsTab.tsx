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
              ? "bg-blue-900/20 border-blue-800/50 hover:bg-blue-900/40"
              : "bg-blue-50/30 border-blue-100 hover:bg-blue-50"
          }`}
        >
          <div className="mt-1 text-blue-500">
            <FileTextOutlined />
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <span
                className={`font-semibold ${
                  isDarkMode ? "text-blue-400" : "text-blue-700"
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
                  isDarkMode ? "text-blue-400" : "text-blue-600"
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
