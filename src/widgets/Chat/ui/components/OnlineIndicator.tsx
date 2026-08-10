import React from "react";

interface IOnlineIndicatorProps {
  className?: string;
  sizeClass?: string;
}

/**
 * Индикатор онлайн-статуса пользователя в чате.
 * Выполнен с чётким белым бордером (border-2 border-white / dark:border-slate-800),
 * который придаёт контрастность индикатору на любых фонах аватарок.
 */
export const OnlineIndicator: React.FC<IOnlineIndicatorProps> = ({
  className = "absolute top-0 right-0 z-20",
  sizeClass = "h-3 w-3",
}) => {
  return (
    <span className={`${className} flex ${sizeClass} select-none pointer-events-none`}>
      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
      <span className="relative inline-flex h-full w-full rounded-full border-2 border-white dark:border-slate-800 bg-emerald-500 shadow-md animate-live-breathe" />
    </span>
  );
};
