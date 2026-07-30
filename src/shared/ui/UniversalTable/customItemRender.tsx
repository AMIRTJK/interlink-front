import type { ReactNode } from "react";

export const renderPaginationItem = (
  _current: number,
  type: "page" | "prev" | "next" | "jump-prev" | "jump-next",
  originalElement: ReactNode,
  customPagination?: boolean
): ReactNode => {
  if (!customPagination) return originalElement;

  const btnClassName =
    "flex items-center h-9 gap-2 px-4 py-1 border border-[#C9D4EB] rounded-lg text-[#0037AF] transition-all";
  const isDisabled = (originalElement as any)?.props?.disabled;
  const activeStyles = isDisabled
    ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400"
    : "hover:opacity-80 cursor-pointer active:scale-95";

  if (type === "prev") {
    return (
      <div
        className={`${btnClassName} ${activeStyles}`}
        role="button"
        aria-label="Предыдущая страница"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Стрелка влево"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span className="text-sm font-medium">Назад</span>
      </div>
    );
  }

  if (type === "next") {
    return (
      <div
        className={`${btnClassName} ${activeStyles}`}
        role="button"
        aria-label="Следующая страница"
      >
        <span className="text-sm font-medium">Дальше</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Стрелка вправо"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    );
  }

  return originalElement;
};
