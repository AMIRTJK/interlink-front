import React from "react";

interface IProps {
  totalUsers: number;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export function UsersTabPagination({
  totalUsers,
  currentPage,
  perPage,
  onPageChange,
}: IProps) {
  if (totalUsers <= perPage) return null;

  const totalPages = Math.ceil(totalUsers / perPage);
  const pageLimit = 5;
  const pagesList: number[] = [];
  let start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + pageLimit - 1);
  if (end - start + 1 < pageLimit) {
    start = Math.max(1, end - pageLimit + 1);
  }
  for (let i = start; i <= end; i++) {
    pagesList.push(i);
  }

  return (
    <div className="flex items-center justify-between px-1 pt-2">
      <span className="text-xs text-slate-400 font-medium">
        Показано {(currentPage - 1) * perPage + 1}–
        {Math.min(currentPage * perPage, totalUsers)} из {totalUsers} сотрудников
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
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
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentPage === p
                ? "bg-blue-600 text-white border border-blue-600 shadow-sm"
                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
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
