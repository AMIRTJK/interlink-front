import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Pencil,
  Trash2,
  Copy,
  CircleUserRound,
  Activity,
  FolderOpen,
} from "lucide-react";
import { IEmployee } from "./model";
import { ActivityTab, DocsTab } from "./parts";
import { If } from "@shared/ui";
import { EmployeeProfileHeader } from "./employeeProfileModal/EmployeeProfileHeader";
import { EmployeeProfileInfoTab } from "./employeeProfileModal/EmployeeProfileInfoTab";

interface IProps {
  employee: IEmployee;
  onClose: () => void;
  onEdit: (e: IEmployee) => void;
  onDelete: (id: number) => void;
  onDuplicate: (e: IEmployee) => void;
}

type TTab = "info" | "activity" | "docs";

const STATUS_STYLE: Record<string, { chip: string; dot: string }> = {
  active: { chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-400", dot: "bg-emerald-500" },
  vacation: { chip: "bg-red-100 text-red-700 dark:bg-red-900/35 dark:text-red-400", dot: "bg-red-500" },
  business_trip: { chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-400", dot: "bg-amber-500" },
};

const TABS: { key: TTab; label: string; icon: React.ReactNode }[] = [
  { key: "info", label: "Информация", icon: <CircleUserRound size={15} /> },
  { key: "activity", label: "Активность", icon: <Activity size={15} /> },
  { key: "docs", label: "Документы", icon: <FolderOpen size={15} /> },
];

const formatDate = (s?: string) => {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString("ru-RU");
};

const genderLabel = (g?: string) =>
  g === "male" ? "Мужской" : g === "female" ? "Женский" : g || "—";

export const EmployeeProfileModal = ({
  employee: e,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
}: IProps) => {
  const [tab, setTab] = useState<TTab>("info");
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const r = e.raw;
  const st = STATUS_STYLE[e.status] || {
    chip: "bg-gray-100 text-gray-500 dark:bg-th-high dark:text-slate-400",
    dot: "bg-gray-400",
  };

  const passport = [r.passport_series, r.passport_number]
    .filter(Boolean)
    .join(" ");
  const roles = (r.roles || []).map((x) => x.name).join(", ");
  const supervisor = r.supervisor?.full_name || e.supervisorName;
  const organization = r.organization?.name || "—";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[9998] bg-th-base/40 backdrop-blur-sm flex items-end justify-center ${
        showPhotoModal ? "pointer-events-none" : ""
      }`}
      onClick={() => !showPhotoModal && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        onClick={(ev) => ev.stopPropagation()}
        className="relative w-full max-w-6xl bg-white border-t border-gray-100 shadow-2xl flex flex-col z-50 rounded-t-3xl h-[90vh] dark:bg-th-raised dark:border-th-high"
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div
          className="h-[3px] w-full mt-2 shrink-0"
          style={{
            background:
              "linear-gradient(90deg, rgb(var(--th-accent-rgb)), rgb(var(--th-accent-rgb)/0.533), transparent)",
          }}
        />

        <div className="flex-1 overflow-y-auto">
          <EmployeeProfileHeader
            e={e}
            st={st}
            onClose={onClose}
            onOpenPhotoModal={() => e.photo && setShowPhotoModal(true)}
          />

          <div className="px-6 pt-4 pb-2 border-b border-gray-100 dark:border-th-high">
            <div className="flex gap-1 p-1 rounded-xl bg-gray-100 w-fit dark:bg-th-high">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    tab === t.key
                      ? "bg-white text-gray-900 shadow-sm dark:bg-th-raised dark:text-slate-100"
                      : "text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 py-5">
            <If is={tab === "info"}>
              <EmployeeProfileInfoTab
                e={e}
                formatDate={formatDate}
                genderLabel={genderLabel}
                passport={passport}
                roles={roles}
                supervisor={supervisor}
                organization={organization}
              />
            </If>

            <If is={tab === "activity"}>
              <ActivityTab />
            </If>

            <If is={tab === "docs"}>
              <DocsTab />
            </If>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0 dark:border-th-high">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(e)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-th-accent-600 text-white text-sm font-semibold shadow-lg shadow-th-accent-900/30 hover:bg-th-accent-700 transition-colors"
            >
              <Pencil size={15} />
              <span>Редактировать</span>
            </button>
            <button
              onClick={() => onDelete(e.id)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => onDuplicate(e)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-semibold transition-colors dark:border-th-high dark:text-slate-400 dark:hover:bg-th-high"
              title="Дублировать"
            >
              <Copy size={15} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Photo Modal */}
      <If is={showPhotoModal && !!e.photo}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-th-base/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
          onClick={() => setShowPhotoModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(ev) => ev.stopPropagation()}
            className="relative max-w-2xl max-h-[90vh]"
          >
            <button
              onClick={() => setShowPhotoModal(false)}
              className="absolute -top-12 right-0 p-2 rounded-full text-white hover:bg-white/20 transition-colors dark:hover:bg-th-high/20"
            >
              <X size={24} />
            </button>
            <img
              src={e.photo || undefined}
              alt={e.fullName}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl max-w-full max-h-[90vh] object-contain shadow-2xl"
            />
          </motion.div>
        </motion.div>
      </If>
    </motion.div>
  );
};
