import React from "react";
import { X, Search } from "lucide-react";
import { IEmployee, statusMeta } from "../model";
import { Avatar } from "../parts";

interface IProps {
  e: IEmployee;
  st: { chip: string; dot: string };
  onClose: () => void;
  onOpenPhotoModal: () => void;
}

export function EmployeeProfileHeader({
  e,
  st,
  onClose,
  onOpenPhotoModal,
}: IProps) {
  return (
    <div className="px-6 pt-5 pb-5 border-b border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${st.chip}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
          {statusMeta(e.status).label}
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl transition-colors hover:bg-gray-100 text-gray-400"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex items-center gap-5">
        <div
          onClick={onOpenPhotoModal}
          className={`relative rounded-2xl overflow-hidden shrink-0 group ${
            e.photo ? "cursor-pointer" : ""
          }`}
          style={{ boxShadow: "rgba(99, 102, 241, 0.333) 0px 8px 28px" }}
        >
          <Avatar e={e} size={80} rounded="rounded-2xl" />
          {e.photo && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-2xl flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-white/20 rounded-full blur-md"
                  style={{ width: 40, height: 40 }}
                />
                <Search
                  size={20}
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity relative"
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {e.nameMain}
          </h2>
          {e.middleName && (
            <p className="text-sm text-gray-500 mt-0.5">{e.middleName}</p>
          )}
          <p className="text-sm font-semibold text-indigo-500 mt-1">
            {e.position}
          </p>
        </div>
      </div>
    </div>
  );
}
