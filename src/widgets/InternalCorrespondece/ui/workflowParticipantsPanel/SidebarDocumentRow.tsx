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
          ? "bg-th-accent-900/20 border-th-accent-900/50 hover:bg-th-accent-900/40"
          : "bg-th-accent-50/40 border-th-accent-100 hover:bg-th-accent-50 hover:shadow-sm hover:border-th-accent-200 dark:bg-th-accent-900/35 dark:border-th-accent-800/50"
      }`}
    >
      <div
        className={`mt-0.5 ${isDarkMode ? "text-th-accent-400" : "text-th-accent-500"}`}
      >
        <FileTextOutlined />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-xs font-semibold truncate transition-colors ${
            isDarkMode
              ? "text-th-accent-400 group-hover:text-th-accent-300"
              : "text-th-accent-700 group-hover:text-th-accent-800"
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
