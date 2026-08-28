import { useState, type MouseEvent, type WheelEvent } from "react";
import { createPortal } from "react-dom";
import { Search, X, ZoomIn, ZoomOut, RotateCcw, User } from "lucide-react";
import { cn } from "@shared/lib";

const API_HOST = (
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_URL) ||
  ""
).replace(/\/+$/, "");

export const resolvePhotoUrl = (raw?: string | null): string => {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }
  const clean = trimmed.replace(/^\/+/, "");
  if (clean.startsWith("storage/")) {
    return `${API_HOST}/${clean}`;
  }
  if (clean.startsWith("user-photos/")) {
    return `${API_HOST}/storage/${clean}`;
  }
  return `${API_HOST}/${clean}`;
};

export interface IUserAvatarItem {
  id?: string | number;
  name?: string;
  role?: string;
  initials?: string;
  color?: string;
  photo?: string | null;
}

interface IAvatarProps {
  colleague?: IUserAvatarItem | null;
  className?: string;
  allowPreview?: boolean;
}

export const Avatar = ({
  colleague,
  className,
  allowPreview = true,
}: IAvatarProps) => {
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [scale, setScale] = useState(1);

  if (!colleague) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0 select-none bg-slate-400 dark:bg-slate-600",
          className || "w-8 h-8",
        )}
      >
        <User className="w-[55%] h-[55%] text-white/90" strokeWidth={2.2} />
      </div>
    );
  }

  const photo = resolvePhotoUrl(colleague.photo);

  const hasValidInitials = Boolean(
    colleague.initials &&
      colleague.initials !== "—" &&
      colleague.initials !== "–" &&
      colleague.initials !== "-" &&
      colleague.initials !== "?" &&
      colleague.name !== "Не назначен" &&
      colleague.id !== "",
  );

  const renderFallback = () => {
    if (hasValidInitials) {
      return <span>{colleague.initials}</span>;
    }
    return <User className="w-[55%] h-[55%] text-white/90" strokeWidth={2.2} />;
  };

  if (err || !photo) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full text-[10px] font-bold text-white shrink-0 select-none",
          colleague.color || "bg-slate-400 dark:bg-slate-600",
          className || "w-8 h-8",
        )}
      >
        {renderFallback()}
      </div>
    );
  }

  const handleAvatarClick = (e: MouseEvent) => {
    if (!allowPreview) return;
    e.preventDefault();
    e.stopPropagation();
    setScale(1);
    setShowPreview(true);
  };

  const handleZoomIn = () => {
    setScale((s) => Math.min(Number((s + 0.25).toFixed(2)), 3));
  };

  const handleZoomOut = () => {
    setScale((s) => Math.max(Number((s - 0.25).toFixed(2)), 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  const handleWheel = (e: WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <>
      <div
        onClick={handleAvatarClick}
        onMouseDown={(e) => {
          if (allowPreview) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={cn(
          "group/taskavatar relative aspect-square rounded-full shrink-0 select-none overflow-hidden",
          className || "w-8 h-8",
          allowPreview ? "cursor-pointer" : "",
        )}
      >
        {!loaded && (
          <div
            className={cn(
              "absolute inset-0 rounded-full animate-pulse flex items-center justify-center text-[10px] font-bold text-white shrink-0",
              colleague.color || "bg-slate-400 dark:bg-slate-600",
            )}
          >
            {renderFallback()}
          </div>
        )}
        <img
          src={photo}
          alt={colleague.name || "Пользователь"}
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
          className={`w-full h-full rounded-full object-cover transition-opacity duration-200 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
        {allowPreview && loaded && (
          <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover/taskavatar:opacity-100 transition-opacity duration-150">
            <Search size={12} className="text-white drop-shadow-sm" strokeWidth={2.5} />
          </div>
        )}
      </div>

      {showPreview &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-avatar-preview-portal="true"
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(false);
            }}
            onWheel={handleWheel}
          >
            <div
              className="relative max-w-xs w-full aspect-square rounded-full flex items-center justify-center shadow-2xl overflow-hidden transition-transform duration-150 ease-out"
              style={{ transform: `scale(${scale})` }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photo}
                alt={colleague.name || "Пользователь"}
                className="w-full h-full rounded-full object-cover shadow-2xl"
              />
            </div>

            {/* Панель управления масштабом */}
            <div
              className="fixed bottom-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20 shadow-2xl z-[100000]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Уменьшить"
                aria-label="Уменьшить"
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Сбросить масштаб"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 3}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Увеличить"
                aria-label="Увеличить"
              >
                <ZoomIn size={16} />
              </button>
              <div className="w-px h-4 bg-white/20 mx-0.5" />
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Сбросить"
                aria-label="Сбросить"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer ml-1"
                title="Закрыть"
                aria-label="Закрыть"
              >
                <X size={16} />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
