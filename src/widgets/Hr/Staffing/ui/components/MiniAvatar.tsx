import React, { useState } from 'react';

export interface IMiniAvatarProps {
  photo?: string;
  initials?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
}

export const MiniAvatar = ({
  photo,
  initials,
  color,
  size = 'sm',
}: IMiniAvatarProps) => {
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
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

  return (
    <div className={`relative ${cls} aspect-square rounded-full shrink-0 overflow-hidden`}>
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
    </div>
  );
};
