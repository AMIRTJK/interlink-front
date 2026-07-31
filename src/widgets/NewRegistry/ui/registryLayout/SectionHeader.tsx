import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { Breadcrumbs } from "@shared/ui";

export const SectionHeader = ({
  activeStatusData,
  t,
  currentDocuments,
  startIndex,
  endIndex,
  breadcrumbs,
}: any) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 m-0 flex flex-col gap-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} className="py-0 mb-1" />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`p-2 rounded-lg bg-gradient-to-r ${
              activeStatusData?.gradient || "from-blue-50 to-blue-100"
            }`}
          >
            {activeStatusData?.icon ? (
              <div className="text-white">{activeStatusData.icon}</div>
            ) : (
              <FileText size={18} className="text-blue-600" />
            )}
          </motion.div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-slate-100">
              <span
                className={`bg-gradient-to-r bg-clip-text text-transparent ${
                  activeStatusData?.gradient || "from-gray-700 to-gray-900"
                }`}
              >
                {activeStatusData?.label || "Все документы"}
              </span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t?.total || "Всего"} {t?.documents || "документов"}:{" "}
              {currentDocuments?.length || 0} | {t?.shown || "Показано"}:{" "}
              {startIndex + 1}-{endIndex}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
