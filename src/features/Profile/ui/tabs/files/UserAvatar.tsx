import { useState, type MouseEvent, type WheelEvent } from "react";
import { createPortal } from "react-dom";
import { Search, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { IFileUser, resolveFilePhotoUrl, getUserInitials } from "./lib";

const AVATAR_COLORS = [
  "bg-indigo-500!",
  "bg-emerald-500!",
  "bg-rose-500!",
  "bg-amber-500!",
  "bg-sky-500!",
  "bg-purple-500!",
  "bg-teal-500!",
  "bg-pink-500!",
];

interface IProps {
  user?: IFileUser | null;
  size?: number;
  ring?: boolean;
  className?: string;
  allowPreview?: boolean;
}

export const UserAvatar = ({
  user,
  size = 32,
  ring = false,
  className = "",
  allowPreview = true,
}: IProps) => {
  const [failed, setFailed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [scale, setScale] = useState(1);

  const photo = user?.photo_url || resolveFilePhotoUrl(user?.photo_path);
  const colorClass = AVATAR_COLORS[(user?.id ?? 0) % AVATAR_COLORS.length];
  const ringClass = ring ? "ring-2 ring-white dark:ring-slate-900" : "";
  const initials = getUserInitials(user);

  if (!photo || failed) {
    return (
      <div
        style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
        className={`rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white! select-none ${colorClass} ${ringClass} ${className}`}
      >
        {initials}
      </div>
    );
  }

  const handleAvatarClick = (e: MouseEvent) => {
    if (!allowPreview) return;
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
        style={{ width: size, height: size }}
        className={`group/avatar relative rounded-full flex-shrink-0 select-none overflow-hidden ${ringClass} ${
          allowPreview ? "cursor-pointer" : ""
        } ${className}`}
      >
        <img
          src={photo}
          alt={initials}
          onError={() => setFailed(true)}
          className="w-full h-full rounded-full object-cover"
        />
        {allowPreview && (
          <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-150">
            <Search
              size={Math.max(12, Math.round(size * 0.35))}
              className="text-white drop-shadow-sm"
              strokeWidth={2.5}
            />
          </div>
        )}
      </div>

      {showPreview &&
        typeof document !== "undefined" &&
        createPortal(
          <div
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
                alt={initials}
                className="w-full h-full rounded-full object-cover shadow-2xl"
              />
            </div>

            {/* Панель управления масштабом и кнопка закрытия */}
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
          document.body
        )}
    </>
  );
};
