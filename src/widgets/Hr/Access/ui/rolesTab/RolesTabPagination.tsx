import React from "react";

interface IProps {
  totalRoles: number;
  rolesPage: number;
  onRolesPageChange: (page: number) => void;
}

export function RolesTabPagination({
  totalRoles,
  rolesPage,
  onRolesPageChange,
}: IProps) {
  if (totalRoles <= 6) return null;

  const totalPages = Math.ceil(totalRoles / 6);
  const pageLimit = 5;
  const pagesList: number[] = [];
  let start = Math.max(1, rolesPage - 2);
  let end = Math.min(totalPages, start + pageLimit - 1);
  if (end - start + 1 < pageLimit) {
    start = Math.max(1, end - pageLimit + 1);
  }
  for (let i = start; i <= end; i++) {
    pagesList.push(i);
  }

  return (
    <div className="flex justify-end pt-2">
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onRolesPageChange(Math.max(1, rolesPage - 1))}
          disabled={rolesPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        {pagesList.map((p) => (
          <button
            key={p}
            onClick={() => onRolesPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
              rolesPage === p
                ? "bg-blue-600 text-white border border-blue-600 shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onRolesPageChange(Math.min(totalPages, rolesPage + 1))}
          disabled={rolesPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
