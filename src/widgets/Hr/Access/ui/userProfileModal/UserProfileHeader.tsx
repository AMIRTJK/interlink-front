import { X, Mail, Phone, Building2, Calendar } from "lucide-react";
import { getInitials } from "../../lib";

interface IProps {
  currentFullName: string;
  currentPosition: string;
  currentEmail?: string;
  currentDepartment?: string;
  formattedJoinedAt?: string;
  statusMeta: {
    chipClass: string;
    label: string;
  };
  onClose: () => void;
}

export function UserProfileHeader({
  currentFullName,
  currentPosition,
  currentEmail,
  currentDepartment,
  formattedJoinedAt,
  statusMeta,
  onClose,
}: IProps) {
  return (
    <div className="px-6 pt-5 pb-4 border-b border-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-blue-600 text-white select-none">
            {getInitials(currentFullName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-800">
                {currentFullName}
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusMeta.chipClass}`}
              >
                {statusMeta.label}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              {currentPosition}
            </p>
            <div className="space-y-1 mt-2">
              {currentEmail && currentEmail !== "—" && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {currentEmail.includes("@") ? (
                    <Mail size={13} className="text-slate-400 shrink-0" />
                  ) : (
                    <Phone size={13} className="text-slate-400 shrink-0" />
                  )}
                  <span className="font-semibold">{currentEmail}</span>
                </div>
              )}
              {currentDepartment && currentDepartment !== "—" && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Building2 size={13} className="text-slate-400 shrink-0" />
                  <span className="font-medium">{currentDepartment}</span>
                </div>
              )}
              {formattedJoinedAt && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={13} className="text-slate-400 shrink-0" />
                  <span>В системе с {formattedJoinedAt}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
