import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export interface IMiniAvatarProps {
  photo?: string;
  initials?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  allowPreview?: boolean;
}

export const MiniAvatar = ({
  photo,
  initials,
  color,
  size = 'sm',
  allowPreview = true,
}: IMiniAvatarProps) => {
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [scale, setScale] = useState(1);

  const cls =
    size === 'xs'
      ? 'w-5 h-5 text-[9px]'
      : size === 'md'
      ? 'w-9 h-9 text-sm'
      : 'w-7 h-7 text-xs';

  if (err || !photo) {
    return (
      <div
        className={`${cls} aspect-square rounded-full flex items-center justify-center text-white font-bold shrink-0 select-none`}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
    );
  }

  const handleAvatarClick = (e: React.MouseEvent) => {
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

  const handleWheel = (e: React.WheelEvent) => {
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
        className={`group/avatar relative ${cls} aspect-square rounded-full shrink-0 overflow-hidden ${
          allowPreview ? 'cursor-pointer' : ''
        }`}
      >
        {!loaded && (
          <div
            className="absolute inset-0 rounded-full animate-pulse flex items-center justify-center text-white/80 font-bold"
            style={{ backgroundColor: color || '#6366f1' }}
          >
            {initials}
          </div>
        )}
        <img
          src={photo}
          alt={initials}
          onLoad={() => setLoaded(true)}
          onError={() => setErr(true)}
          className={`w-full h-full rounded-full object-cover transition-opacity duration-200 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {allowPreview && loaded && (
          <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-150">
            <Search
              size={size === 'md' ? 14 : size === 'sm' ? 12 : 9}
              className="text-white drop-shadow-sm"
              strokeWidth={2.5}
            />
          </div>
        )}
      </div>

      {showPreview &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none"
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
              className="fixed bottom-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/20 shadow-2xl z-[10000]"
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
