import { FileTextOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

interface SidebarDocumentRowProps {
  doc: any;
  isDarkMode?: boolean;
}

export const SidebarDocumentRow = ({
  doc,
  isDarkMode,
}: SidebarDocumentRowProps) => {
  return (
    <Link
      to={`/modules/correspondence/internal/incoming/${doc.id}`}
      className={`flex items-start gap-3 p-3 rounded-lg border mb-2 transition-all cursor-pointer group no-underline ${
        isDarkMode
          ? "bg-blue-900/20 border-blue-900/50 hover:bg-blue-900/40"
          : "bg-blue-50/40 border-blue-100 hover:bg-blue-50 hover:shadow-sm hover:border-blue-200"
      }`}
    >
      <div
        className={`mt-0.5 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`}
      >
        <FileTextOutlined />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-xs font-semibold truncate transition-colors ${
            isDarkMode
              ? "text-blue-400 group-hover:text-blue-300"
              : "text-blue-700 group-hover:text-blue-800"
          }`}
        >
          {doc.reg_number || "Без номера"}
        </div>
        <div
          className={`text-xs line-clamp-2 leading-tight mt-0.5 ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {doc.subject}
        </div>
        <div
          className={`text-[10px] mt-1 ${
            isDarkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {doc.date}
        </div>
      </div>
    </Link>
  );
};
