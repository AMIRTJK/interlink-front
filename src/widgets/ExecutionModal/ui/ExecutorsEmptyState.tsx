interface ExecutorsEmptyStateProps {
  onAssign?: () => void;
  className?: string;
}

export const ExecutorsEmptyState = ({
  onAssign,
  className,
}: ExecutorsEmptyStateProps) => {
  return (
    <div
      className={`flex flex-col items-center max-w-md w-full animate-fade-in ${className || ""}`}
    >
      <div className="mb-5 text-blue-100 bg-blue-50 p-6 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-16 h-16 text-blue-300"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Исполнители не назначены
      </h3>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed text-center">
        Пожалуйста, выберите ответственных лиц в левой панели,
        <br className="hidden md:block" /> чтобы продолжить процесс визирования.
      </p>

      <button
        onClick={onAssign}
        className="flex cursor-pointer items-center gap-2 text-[#0037AF] font-semibold hover:text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        Назначить исполнителей
      </button>
    </div>
  );
};
